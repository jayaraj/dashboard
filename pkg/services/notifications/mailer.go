// Copyright 2014 The Gogs Authors. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

package notifications

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"html/template"
	"net"
	"strconv"

	m "github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/setting"
	gomail "gopkg.in/mail.v2"
)

func send(msg *Message) (int, error) {
	dialer, err := createDialer()
	if err != nil {
		return 0, err
	}

	for _, address := range msg.To {
		m := gomail.NewMessage()
		m.SetHeader("From", msg.From)
		m.SetHeader("To", address)
		m.SetHeader("Subject", msg.Subject)
		for _, file := range msg.EmbededFiles {
			m.Embed(file)
		}

		m.SetBody("text/html", msg.Body)

		if err := dialer.DialAndSend(m); err != nil {
			return 0, err
		}
	}

	return len(msg.To), nil
}

func createDialer() (*gomail.Dialer, error) {
	host, port, err := net.SplitHostPort(setting.Smtp.Host)

	if err != nil {
		return nil, err
	}
	iPort, err := strconv.Atoi(port)
	if err != nil {
		return nil, err
	}

	tlsconfig := &tls.Config{
		InsecureSkipVerify: setting.Smtp.SkipVerify,
		ServerName:         host,
	}

	if setting.Smtp.CertFile != "" {
		cert, err := tls.LoadX509KeyPair(setting.Smtp.CertFile, setting.Smtp.KeyFile)
		if err != nil {
			return nil, fmt.Errorf("Could not load cert or key file. error: %v", err)
		}
		tlsconfig.Certificates = []tls.Certificate{cert}
	}

	d := gomail.NewDialer(host, iPort, setting.Smtp.User, setting.Smtp.Password)
	d.TLSConfig = tlsconfig
	if setting.Smtp.EhloIdentity != "" {
		d.LocalName = setting.Smtp.EhloIdentity
	} else {
		d.LocalName = setting.InstanceName
	}
	return d, nil
}

func buildEmailMessage(cmd *m.SendEmailCommand) (*Message, error) {
	if !setting.Smtp.Enabled {
		return nil, m.ErrSmtpNotEnabled
	}

	var buffer bytes.Buffer
	var err error

	data := cmd.Data
	if data == nil {
		data = make(map[string]interface{}, 10)
	}

	setDefaultTemplateData(data, nil)
	err = mailTemplates.ExecuteTemplate(&buffer, cmd.Template, data)
	if err != nil {
		return nil, err
	}

	subject := cmd.Subject
	if cmd.Subject == "" {
		var subjectText interface{}
		subjectData := data["Subject"].(map[string]interface{})
		subjectText, hasSubject := subjectData["value"]

		if !hasSubject {
			return nil, fmt.Errorf("Missing subject in Template %s", cmd.Template)
		}

		subjectTmpl, err := template.New("subject").Parse(subjectText.(string))
		if err != nil {
			return nil, err
		}

		var subjectBuffer bytes.Buffer
		err = subjectTmpl.ExecuteTemplate(&subjectBuffer, "subject", data)
		if err != nil {
			return nil, err
		}

		subject = subjectBuffer.String()
	}

	return &Message{
		To:           cmd.To,
		From:         fmt.Sprintf("%s <%s>", setting.Smtp.FromName, setting.Smtp.FromAddress),
		Subject:      subject,
		Body:         buffer.String(),
		EmbededFiles: cmd.EmbededFiles,
	}, nil
}
