package migrations

import . "github.com/grafana/grafana/pkg/services/sqlstore/migrator"

func addOrgMigrations(mg *Migrator) {
	orgV1 := Table{
		Name: "org",
		Columns: []*Column{
			&Column{Name: "id", Type: DB_BigInt, IsPrimaryKey: true, IsAutoIncrement: true},
			&Column{Name: "version", Type: DB_Int, Nullable: false},
			&Column{Name: "name", Type: DB_NVarchar, Length: 255, Nullable: false},
			&Column{Name: "address1", Type: DB_NVarchar, Length: 255, Nullable: true},
			&Column{Name: "address2", Type: DB_NVarchar, Length: 255, Nullable: true},
			&Column{Name: "city", Type: DB_NVarchar, Length: 255, Nullable: true},
			&Column{Name: "state", Type: DB_NVarchar, Length: 255, Nullable: true},
			&Column{Name: "zip_code", Type: DB_NVarchar, Length: 50, Nullable: true},
			&Column{Name: "country", Type: DB_NVarchar, Length: 255, Nullable: true},
			&Column{Name: "billing_email", Type: DB_NVarchar, Length: 255, Nullable: true},
			&Column{Name: "created", Type: DB_DateTime, Nullable: false},
			&Column{Name: "updated", Type: DB_DateTime, Nullable: false},
		},
		Indices: []*Index{
			&Index{Cols: []string{"name"}, Type: UniqueIndex},
		},
	}

	// add org v1
	mg.AddMigration("create org table v1", NewAddTableMigration(orgV1))
	addTableIndicesMigrations(mg, "v1", orgV1)

	orgUserV1 := Table{
		Name: "org_user",
		Columns: []*Column{
			&Column{Name: "id", Type: DB_BigInt, IsPrimaryKey: true, IsAutoIncrement: true},
			&Column{Name: "org_id", Type: DB_BigInt},
			&Column{Name: "user_id", Type: DB_BigInt},
			&Column{Name: "role", Type: DB_NVarchar, Length: 20},
			&Column{Name: "created", Type: DB_DateTime},
			&Column{Name: "updated", Type: DB_DateTime},
		},
		Indices: []*Index{
			&Index{Cols: []string{"org_id"}},
			&Index{Cols: []string{"org_id", "user_id"}, Type: UniqueIndex},
		},
	}

	//-------  org_user table -------------------
	mg.AddMigration("create org_user table v1", NewAddTableMigration(orgUserV1))
	addTableIndicesMigrations(mg, "v1", orgUserV1)

	//-------  copy data from old table-------------------
	mg.AddMigration("copy data account to org", NewCopyTableDataMigration("org", "account", map[string]string{
		"id":      "id",
		"version": "version",
		"name":    "name",
		"created": "created",
		"updated": "updated",
	}))

	mg.AddMigration("copy data account_user to org_user", NewCopyTableDataMigration("org_user", "account_user", map[string]string{
		"id":      "id",
		"org_id":  "account_id",
		"user_id": "user_id",
		"role":    "role",
		"created": "created",
		"updated": "updated",
	}))

	mg.AddMigration("Drop old table account", NewDropTableMigration("account"))
	mg.AddMigration("Drop old table account_user", NewDropTableMigration("account_user"))
}
