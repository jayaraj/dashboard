// THIS FILE IS AUTOMATICALLY GENERATED. DO NOT EDIT.

package iot_test

import (
	"bytes"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/iot"
)

var _ time.Duration
var _ bytes.Buffer

func ExampleIoT_AcceptCertificateTransfer() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.AcceptCertificateTransferInput{
		CertificateId: aws.String("CertificateId"), // Required
		SetAsActive:   aws.Bool(true),
	}
	resp, err := svc.AcceptCertificateTransfer(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_AttachPrincipalPolicy() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.AttachPrincipalPolicyInput{
		PolicyName: aws.String("PolicyName"), // Required
		Principal:  aws.String("Principal"),  // Required
	}
	resp, err := svc.AttachPrincipalPolicy(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_AttachThingPrincipal() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.AttachThingPrincipalInput{
		Principal: aws.String("Principal"), // Required
		ThingName: aws.String("ThingName"), // Required
	}
	resp, err := svc.AttachThingPrincipal(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_CancelCertificateTransfer() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.CancelCertificateTransferInput{
		CertificateId: aws.String("CertificateId"), // Required
	}
	resp, err := svc.CancelCertificateTransfer(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_CreateCertificateFromCsr() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.CreateCertificateFromCsrInput{
		CertificateSigningRequest: aws.String("CertificateSigningRequest"), // Required
		SetAsActive:               aws.Bool(true),
	}
	resp, err := svc.CreateCertificateFromCsr(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_CreateKeysAndCertificate() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.CreateKeysAndCertificateInput{
		SetAsActive: aws.Bool(true),
	}
	resp, err := svc.CreateKeysAndCertificate(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_CreatePolicy() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.CreatePolicyInput{
		PolicyDocument: aws.String("PolicyDocument"), // Required
		PolicyName:     aws.String("PolicyName"),     // Required
	}
	resp, err := svc.CreatePolicy(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_CreatePolicyVersion() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.CreatePolicyVersionInput{
		PolicyDocument: aws.String("PolicyDocument"), // Required
		PolicyName:     aws.String("PolicyName"),     // Required
		SetAsDefault:   aws.Bool(true),
	}
	resp, err := svc.CreatePolicyVersion(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_CreateThing() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.CreateThingInput{
		ThingName: aws.String("ThingName"), // Required
		AttributePayload: &iot.AttributePayload{
			Attributes: map[string]*string{
				"Key": aws.String("AttributeValue"), // Required
				// More values...
			},
			Merge: aws.Bool(true),
		},
		ThingTypeName: aws.String("ThingTypeName"),
	}
	resp, err := svc.CreateThing(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_CreateThingType() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.CreateThingTypeInput{
		ThingTypeName: aws.String("ThingTypeName"), // Required
		ThingTypeProperties: &iot.ThingTypeProperties{
			SearchableAttributes: []*string{
				aws.String("AttributeName"), // Required
				// More values...
			},
			ThingTypeDescription: aws.String("ThingTypeDescription"),
		},
	}
	resp, err := svc.CreateThingType(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_CreateTopicRule() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.CreateTopicRuleInput{
		RuleName: aws.String("RuleName"), // Required
		TopicRulePayload: &iot.TopicRulePayload{ // Required
			Actions: []*iot.Action{ // Required
				{ // Required
					CloudwatchAlarm: &iot.CloudwatchAlarmAction{
						AlarmName:   aws.String("AlarmName"),   // Required
						RoleArn:     aws.String("AwsArn"),      // Required
						StateReason: aws.String("StateReason"), // Required
						StateValue:  aws.String("StateValue"),  // Required
					},
					CloudwatchMetric: &iot.CloudwatchMetricAction{
						MetricName:      aws.String("MetricName"),      // Required
						MetricNamespace: aws.String("MetricNamespace"), // Required
						MetricUnit:      aws.String("MetricUnit"),      // Required
						MetricValue:     aws.String("MetricValue"),     // Required
						RoleArn:         aws.String("AwsArn"),          // Required
						MetricTimestamp: aws.String("MetricTimestamp"),
					},
					DynamoDB: &iot.DynamoDBAction{
						HashKeyField:  aws.String("HashKeyField"), // Required
						HashKeyValue:  aws.String("HashKeyValue"), // Required
						RoleArn:       aws.String("AwsArn"),       // Required
						TableName:     aws.String("TableName"),    // Required
						HashKeyType:   aws.String("DynamoKeyType"),
						Operation:     aws.String("DynamoOperation"),
						PayloadField:  aws.String("PayloadField"),
						RangeKeyField: aws.String("RangeKeyField"),
						RangeKeyType:  aws.String("DynamoKeyType"),
						RangeKeyValue: aws.String("RangeKeyValue"),
					},
					Elasticsearch: &iot.ElasticsearchAction{
						Endpoint: aws.String("ElasticsearchEndpoint"), // Required
						Id:       aws.String("ElasticsearchId"),       // Required
						Index:    aws.String("ElasticsearchIndex"),    // Required
						RoleArn:  aws.String("AwsArn"),                // Required
						Type:     aws.String("ElasticsearchType"),     // Required
					},
					Firehose: &iot.FirehoseAction{
						DeliveryStreamName: aws.String("DeliveryStreamName"), // Required
						RoleArn:            aws.String("AwsArn"),             // Required
						Separator:          aws.String("FirehoseSeparator"),
					},
					Kinesis: &iot.KinesisAction{
						RoleArn:      aws.String("AwsArn"),     // Required
						StreamName:   aws.String("StreamName"), // Required
						PartitionKey: aws.String("PartitionKey"),
					},
					Lambda: &iot.LambdaAction{
						FunctionArn: aws.String("FunctionArn"), // Required
					},
					Republish: &iot.RepublishAction{
						RoleArn: aws.String("AwsArn"),       // Required
						Topic:   aws.String("TopicPattern"), // Required
					},
					S3: &iot.S3Action{
						BucketName: aws.String("BucketName"), // Required
						Key:        aws.String("Key"),        // Required
						RoleArn:    aws.String("AwsArn"),     // Required
					},
					Sns: &iot.SnsAction{
						RoleArn:       aws.String("AwsArn"), // Required
						TargetArn:     aws.String("AwsArn"), // Required
						MessageFormat: aws.String("MessageFormat"),
					},
					Sqs: &iot.SqsAction{
						QueueUrl:  aws.String("QueueUrl"), // Required
						RoleArn:   aws.String("AwsArn"),   // Required
						UseBase64: aws.Bool(true),
					},
				},
				// More values...
			},
			Sql:              aws.String("SQL"), // Required
			AwsIotSqlVersion: aws.String("AwsIotSqlVersion"),
			Description:      aws.String("Description"),
			RuleDisabled:     aws.Bool(true),
		},
	}
	resp, err := svc.CreateTopicRule(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_DeleteCACertificate() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.DeleteCACertificateInput{
		CertificateId: aws.String("CertificateId"), // Required
	}
	resp, err := svc.DeleteCACertificate(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_DeleteCertificate() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.DeleteCertificateInput{
		CertificateId: aws.String("CertificateId"), // Required
	}
	resp, err := svc.DeleteCertificate(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_DeletePolicy() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.DeletePolicyInput{
		PolicyName: aws.String("PolicyName"), // Required
	}
	resp, err := svc.DeletePolicy(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_DeletePolicyVersion() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.DeletePolicyVersionInput{
		PolicyName:      aws.String("PolicyName"),      // Required
		PolicyVersionId: aws.String("PolicyVersionId"), // Required
	}
	resp, err := svc.DeletePolicyVersion(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_DeleteRegistrationCode() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	var params *iot.DeleteRegistrationCodeInput
	resp, err := svc.DeleteRegistrationCode(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_DeleteThing() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.DeleteThingInput{
		ThingName:       aws.String("ThingName"), // Required
		ExpectedVersion: aws.Int64(1),
	}
	resp, err := svc.DeleteThing(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_DeleteThingType() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.DeleteThingTypeInput{
		ThingTypeName: aws.String("ThingTypeName"), // Required
	}
	resp, err := svc.DeleteThingType(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_DeleteTopicRule() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.DeleteTopicRuleInput{
		RuleName: aws.String("RuleName"), // Required
	}
	resp, err := svc.DeleteTopicRule(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_DeprecateThingType() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.DeprecateThingTypeInput{
		ThingTypeName: aws.String("ThingTypeName"), // Required
		UndoDeprecate: aws.Bool(true),
	}
	resp, err := svc.DeprecateThingType(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_DescribeCACertificate() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.DescribeCACertificateInput{
		CertificateId: aws.String("CertificateId"), // Required
	}
	resp, err := svc.DescribeCACertificate(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_DescribeCertificate() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.DescribeCertificateInput{
		CertificateId: aws.String("CertificateId"), // Required
	}
	resp, err := svc.DescribeCertificate(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_DescribeEndpoint() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	var params *iot.DescribeEndpointInput
	resp, err := svc.DescribeEndpoint(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_DescribeThing() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.DescribeThingInput{
		ThingName: aws.String("ThingName"), // Required
	}
	resp, err := svc.DescribeThing(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_DescribeThingType() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.DescribeThingTypeInput{
		ThingTypeName: aws.String("ThingTypeName"), // Required
	}
	resp, err := svc.DescribeThingType(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_DetachPrincipalPolicy() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.DetachPrincipalPolicyInput{
		PolicyName: aws.String("PolicyName"), // Required
		Principal:  aws.String("Principal"),  // Required
	}
	resp, err := svc.DetachPrincipalPolicy(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_DetachThingPrincipal() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.DetachThingPrincipalInput{
		Principal: aws.String("Principal"), // Required
		ThingName: aws.String("ThingName"), // Required
	}
	resp, err := svc.DetachThingPrincipal(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_DisableTopicRule() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.DisableTopicRuleInput{
		RuleName: aws.String("RuleName"), // Required
	}
	resp, err := svc.DisableTopicRule(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_EnableTopicRule() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.EnableTopicRuleInput{
		RuleName: aws.String("RuleName"), // Required
	}
	resp, err := svc.EnableTopicRule(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_GetLoggingOptions() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	var params *iot.GetLoggingOptionsInput
	resp, err := svc.GetLoggingOptions(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_GetPolicy() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.GetPolicyInput{
		PolicyName: aws.String("PolicyName"), // Required
	}
	resp, err := svc.GetPolicy(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_GetPolicyVersion() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.GetPolicyVersionInput{
		PolicyName:      aws.String("PolicyName"),      // Required
		PolicyVersionId: aws.String("PolicyVersionId"), // Required
	}
	resp, err := svc.GetPolicyVersion(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_GetRegistrationCode() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	var params *iot.GetRegistrationCodeInput
	resp, err := svc.GetRegistrationCode(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_GetTopicRule() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.GetTopicRuleInput{
		RuleName: aws.String("RuleName"), // Required
	}
	resp, err := svc.GetTopicRule(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_ListCACertificates() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.ListCACertificatesInput{
		AscendingOrder: aws.Bool(true),
		Marker:         aws.String("Marker"),
		PageSize:       aws.Int64(1),
	}
	resp, err := svc.ListCACertificates(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_ListCertificates() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.ListCertificatesInput{
		AscendingOrder: aws.Bool(true),
		Marker:         aws.String("Marker"),
		PageSize:       aws.Int64(1),
	}
	resp, err := svc.ListCertificates(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_ListCertificatesByCA() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.ListCertificatesByCAInput{
		CaCertificateId: aws.String("CertificateId"), // Required
		AscendingOrder:  aws.Bool(true),
		Marker:          aws.String("Marker"),
		PageSize:        aws.Int64(1),
	}
	resp, err := svc.ListCertificatesByCA(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_ListOutgoingCertificates() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.ListOutgoingCertificatesInput{
		AscendingOrder: aws.Bool(true),
		Marker:         aws.String("Marker"),
		PageSize:       aws.Int64(1),
	}
	resp, err := svc.ListOutgoingCertificates(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_ListPolicies() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.ListPoliciesInput{
		AscendingOrder: aws.Bool(true),
		Marker:         aws.String("Marker"),
		PageSize:       aws.Int64(1),
	}
	resp, err := svc.ListPolicies(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_ListPolicyPrincipals() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.ListPolicyPrincipalsInput{
		PolicyName:     aws.String("PolicyName"), // Required
		AscendingOrder: aws.Bool(true),
		Marker:         aws.String("Marker"),
		PageSize:       aws.Int64(1),
	}
	resp, err := svc.ListPolicyPrincipals(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_ListPolicyVersions() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.ListPolicyVersionsInput{
		PolicyName: aws.String("PolicyName"), // Required
	}
	resp, err := svc.ListPolicyVersions(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_ListPrincipalPolicies() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.ListPrincipalPoliciesInput{
		Principal:      aws.String("Principal"), // Required
		AscendingOrder: aws.Bool(true),
		Marker:         aws.String("Marker"),
		PageSize:       aws.Int64(1),
	}
	resp, err := svc.ListPrincipalPolicies(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_ListPrincipalThings() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.ListPrincipalThingsInput{
		Principal:  aws.String("Principal"), // Required
		MaxResults: aws.Int64(1),
		NextToken:  aws.String("NextToken"),
	}
	resp, err := svc.ListPrincipalThings(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_ListThingPrincipals() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.ListThingPrincipalsInput{
		ThingName: aws.String("ThingName"), // Required
	}
	resp, err := svc.ListThingPrincipals(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_ListThingTypes() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.ListThingTypesInput{
		MaxResults:    aws.Int64(1),
		NextToken:     aws.String("NextToken"),
		ThingTypeName: aws.String("ThingTypeName"),
	}
	resp, err := svc.ListThingTypes(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_ListThings() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.ListThingsInput{
		AttributeName:  aws.String("AttributeName"),
		AttributeValue: aws.String("AttributeValue"),
		MaxResults:     aws.Int64(1),
		NextToken:      aws.String("NextToken"),
		ThingTypeName:  aws.String("ThingTypeName"),
	}
	resp, err := svc.ListThings(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_ListTopicRules() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.ListTopicRulesInput{
		MaxResults:   aws.Int64(1),
		NextToken:    aws.String("NextToken"),
		RuleDisabled: aws.Bool(true),
		Topic:        aws.String("Topic"),
	}
	resp, err := svc.ListTopicRules(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_RegisterCACertificate() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.RegisterCACertificateInput{
		CaCertificate:           aws.String("CertificatePem"), // Required
		VerificationCertificate: aws.String("CertificatePem"), // Required
		AllowAutoRegistration:   aws.Bool(true),
		SetAsActive:             aws.Bool(true),
	}
	resp, err := svc.RegisterCACertificate(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_RegisterCertificate() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.RegisterCertificateInput{
		CertificatePem:   aws.String("CertificatePem"), // Required
		CaCertificatePem: aws.String("CertificatePem"),
		SetAsActive:      aws.Bool(true),
	}
	resp, err := svc.RegisterCertificate(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_RejectCertificateTransfer() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.RejectCertificateTransferInput{
		CertificateId: aws.String("CertificateId"), // Required
		RejectReason:  aws.String("Message"),
	}
	resp, err := svc.RejectCertificateTransfer(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_ReplaceTopicRule() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.ReplaceTopicRuleInput{
		RuleName: aws.String("RuleName"), // Required
		TopicRulePayload: &iot.TopicRulePayload{ // Required
			Actions: []*iot.Action{ // Required
				{ // Required
					CloudwatchAlarm: &iot.CloudwatchAlarmAction{
						AlarmName:   aws.String("AlarmName"),   // Required
						RoleArn:     aws.String("AwsArn"),      // Required
						StateReason: aws.String("StateReason"), // Required
						StateValue:  aws.String("StateValue"),  // Required
					},
					CloudwatchMetric: &iot.CloudwatchMetricAction{
						MetricName:      aws.String("MetricName"),      // Required
						MetricNamespace: aws.String("MetricNamespace"), // Required
						MetricUnit:      aws.String("MetricUnit"),      // Required
						MetricValue:     aws.String("MetricValue"),     // Required
						RoleArn:         aws.String("AwsArn"),          // Required
						MetricTimestamp: aws.String("MetricTimestamp"),
					},
					DynamoDB: &iot.DynamoDBAction{
						HashKeyField:  aws.String("HashKeyField"), // Required
						HashKeyValue:  aws.String("HashKeyValue"), // Required
						RoleArn:       aws.String("AwsArn"),       // Required
						TableName:     aws.String("TableName"),    // Required
						HashKeyType:   aws.String("DynamoKeyType"),
						Operation:     aws.String("DynamoOperation"),
						PayloadField:  aws.String("PayloadField"),
						RangeKeyField: aws.String("RangeKeyField"),
						RangeKeyType:  aws.String("DynamoKeyType"),
						RangeKeyValue: aws.String("RangeKeyValue"),
					},
					Elasticsearch: &iot.ElasticsearchAction{
						Endpoint: aws.String("ElasticsearchEndpoint"), // Required
						Id:       aws.String("ElasticsearchId"),       // Required
						Index:    aws.String("ElasticsearchIndex"),    // Required
						RoleArn:  aws.String("AwsArn"),                // Required
						Type:     aws.String("ElasticsearchType"),     // Required
					},
					Firehose: &iot.FirehoseAction{
						DeliveryStreamName: aws.String("DeliveryStreamName"), // Required
						RoleArn:            aws.String("AwsArn"),             // Required
						Separator:          aws.String("FirehoseSeparator"),
					},
					Kinesis: &iot.KinesisAction{
						RoleArn:      aws.String("AwsArn"),     // Required
						StreamName:   aws.String("StreamName"), // Required
						PartitionKey: aws.String("PartitionKey"),
					},
					Lambda: &iot.LambdaAction{
						FunctionArn: aws.String("FunctionArn"), // Required
					},
					Republish: &iot.RepublishAction{
						RoleArn: aws.String("AwsArn"),       // Required
						Topic:   aws.String("TopicPattern"), // Required
					},
					S3: &iot.S3Action{
						BucketName: aws.String("BucketName"), // Required
						Key:        aws.String("Key"),        // Required
						RoleArn:    aws.String("AwsArn"),     // Required
					},
					Sns: &iot.SnsAction{
						RoleArn:       aws.String("AwsArn"), // Required
						TargetArn:     aws.String("AwsArn"), // Required
						MessageFormat: aws.String("MessageFormat"),
					},
					Sqs: &iot.SqsAction{
						QueueUrl:  aws.String("QueueUrl"), // Required
						RoleArn:   aws.String("AwsArn"),   // Required
						UseBase64: aws.Bool(true),
					},
				},
				// More values...
			},
			Sql:              aws.String("SQL"), // Required
			AwsIotSqlVersion: aws.String("AwsIotSqlVersion"),
			Description:      aws.String("Description"),
			RuleDisabled:     aws.Bool(true),
		},
	}
	resp, err := svc.ReplaceTopicRule(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_SetDefaultPolicyVersion() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.SetDefaultPolicyVersionInput{
		PolicyName:      aws.String("PolicyName"),      // Required
		PolicyVersionId: aws.String("PolicyVersionId"), // Required
	}
	resp, err := svc.SetDefaultPolicyVersion(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_SetLoggingOptions() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.SetLoggingOptionsInput{
		LoggingOptionsPayload: &iot.LoggingOptionsPayload{ // Required
			RoleArn:  aws.String("AwsArn"), // Required
			LogLevel: aws.String("LogLevel"),
		},
	}
	resp, err := svc.SetLoggingOptions(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_TransferCertificate() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.TransferCertificateInput{
		CertificateId:    aws.String("CertificateId"), // Required
		TargetAwsAccount: aws.String("AwsAccountId"),  // Required
		TransferMessage:  aws.String("Message"),
	}
	resp, err := svc.TransferCertificate(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_UpdateCACertificate() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.UpdateCACertificateInput{
		CertificateId:             aws.String("CertificateId"), // Required
		NewAutoRegistrationStatus: aws.String("AutoRegistrationStatus"),
		NewStatus:                 aws.String("CACertificateStatus"),
	}
	resp, err := svc.UpdateCACertificate(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_UpdateCertificate() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.UpdateCertificateInput{
		CertificateId: aws.String("CertificateId"),     // Required
		NewStatus:     aws.String("CertificateStatus"), // Required
	}
	resp, err := svc.UpdateCertificate(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}

func ExampleIoT_UpdateThing() {
	sess, err := session.NewSession()
	if err != nil {
		fmt.Println("failed to create session,", err)
		return
	}

	svc := iot.New(sess)

	params := &iot.UpdateThingInput{
		ThingName: aws.String("ThingName"), // Required
		AttributePayload: &iot.AttributePayload{
			Attributes: map[string]*string{
				"Key": aws.String("AttributeValue"), // Required
				// More values...
			},
			Merge: aws.Bool(true),
		},
		ExpectedVersion: aws.Int64(1),
		RemoveThingType: aws.Bool(true),
		ThingTypeName:   aws.String("ThingTypeName"),
	}
	resp, err := svc.UpdateThing(params)

	if err != nil {
		// Print the error, cast err to awserr.Error to get the Code and
		// Message from an error.
		fmt.Println(err.Error())
		return
	}

	// Pretty-print the response data.
	fmt.Println(resp)
}
