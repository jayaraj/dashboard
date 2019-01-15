package mysql

import (
	"database/sql"
	"errors"
	"fmt"
	"reflect"
	"strconv"
	"strings"

	"crypto/tls"
	"crypto/x509"

	"github.com/go-sql-driver/mysql"
	"github.com/go-xorm/core"
	"github.com/grafana/grafana/pkg/log"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/tsdb"
)

func init() {
	tsdb.RegisterTsdbQueryEndpoint("mysql", newMysqlQueryEndpoint)
}

func newMysqlQueryEndpoint(datasource *models.DataSource) (tsdb.TsdbQueryEndpoint, error) {
	logger := log.New("tsdb.mysql")

	protocol := "tcp"
	if strings.HasPrefix(datasource.Url, "/") {
		protocol = "unix"
	}
	cnnstr := fmt.Sprintf("%s:%s@%s(%s)/%s?collation=utf8mb4_unicode_ci&parseTime=true&loc=UTC&allowNativePasswords=true",
		datasource.User,
		datasource.Password,
		protocol,
		datasource.Url,
		datasource.Database,
	)

	var tlsSkipVerify, tlsAuth, tlsAuthWithCACert bool
	if datasource.JsonData != nil {
		tlsAuth = datasource.JsonData.Get("tlsAuth").MustBool(false)
		tlsAuthWithCACert = datasource.JsonData.Get("tlsAuthWithCACert").MustBool(false)
		tlsSkipVerify = datasource.JsonData.Get("tlsSkipVerify").MustBool(false)
	}

	if tlsAuth || tlsAuthWithCACert {

		secureJsonData := datasource.SecureJsonData.Decrypt()
		tlsConfig := tls.Config{
			InsecureSkipVerify: tlsSkipVerify,
		}

		if tlsAuthWithCACert && len(secureJsonData["tlsCACert"]) > 0 {

			caPool := x509.NewCertPool()
			if ok := caPool.AppendCertsFromPEM([]byte(secureJsonData["tlsCACert"])); !ok {
				return nil, errors.New("Failed to parse TLS CA PEM certificate")
			}

			tlsConfig.RootCAs = caPool
		}

		if tlsAuth {
			certs, err := tls.X509KeyPair([]byte(secureJsonData["tlsClientCert"]), []byte(secureJsonData["tlsClientKey"]))
			if err != nil {
				return nil, err
			}
			clientCert := make([]tls.Certificate, 0, 1)
			clientCert = append(clientCert, certs)

			tlsConfig.Certificates = clientCert
		}

		mysql.RegisterTLSConfig(datasource.Name, &tlsConfig)
		cnnstr += "&tls=" + datasource.Name
	}

	logger.Debug("getEngine", "connection", cnnstr)

	config := tsdb.SqlQueryEndpointConfiguration{
		DriverName:        "mysql",
		ConnectionString:  cnnstr,
		Datasource:        datasource,
		TimeColumnNames:   []string{"time", "time_sec"},
		MetricColumnTypes: []string{"CHAR", "VARCHAR", "TINYTEXT", "TEXT", "MEDIUMTEXT", "LONGTEXT"},
	}

	rowTransformer := mysqlRowTransformer{
		log: logger,
	}

	return tsdb.NewSqlQueryEndpoint(&config, &rowTransformer, newMysqlMacroEngine(), logger)
}

type mysqlRowTransformer struct {
	log log.Logger
}

func (t *mysqlRowTransformer) Transform(columnTypes []*sql.ColumnType, rows *core.Rows) (tsdb.RowValues, error) {
	values := make([]interface{}, len(columnTypes))

	for i := range values {
		scanType := columnTypes[i].ScanType()
		values[i] = reflect.New(scanType).Interface()

		if columnTypes[i].DatabaseTypeName() == "BIT" {
			values[i] = new([]byte)
		}
	}

	if err := rows.Scan(values...); err != nil {
		return nil, err
	}

	for i := 0; i < len(columnTypes); i++ {
		typeName := reflect.ValueOf(values[i]).Type().String()

		switch typeName {
		case "*sql.RawBytes":
			values[i] = string(*values[i].(*sql.RawBytes))
		case "*mysql.NullTime":
			sqlTime := (*values[i].(*mysql.NullTime))
			if sqlTime.Valid {
				values[i] = sqlTime.Time
			} else {
				values[i] = nil
			}
		case "*sql.NullInt64":
			nullInt64 := (*values[i].(*sql.NullInt64))
			if nullInt64.Valid {
				values[i] = nullInt64.Int64
			} else {
				values[i] = nil
			}
		case "*sql.NullFloat64":
			nullFloat64 := (*values[i].(*sql.NullFloat64))
			if nullFloat64.Valid {
				values[i] = nullFloat64.Float64
			} else {
				values[i] = nil
			}
		}

		if columnTypes[i].DatabaseTypeName() == "DECIMAL" {
			f, err := strconv.ParseFloat(values[i].(string), 64)

			if err == nil {
				values[i] = f
			} else {
				values[i] = nil
			}
		}
	}

	return values, nil
}
