package cloudwatch

import (
	"context"
	"errors"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awsutil"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/cloudwatch"
	cwapi "github.com/grafana/grafana/pkg/api/cloudwatch"
	"github.com/grafana/grafana/pkg/components/simplejson"
	"github.com/grafana/grafana/pkg/metrics"
	"github.com/grafana/grafana/pkg/tsdb"
)

var metricsMap map[string][]string
var dimensionsMap map[string][]string

type suggestData struct {
	Text  string
	Value string
}

type CustomMetricsCache struct {
	Expire time.Time
	Cache  []string
}

var customMetricsMetricsMap map[string]map[string]map[string]*CustomMetricsCache
var customMetricsDimensionsMap map[string]map[string]map[string]*CustomMetricsCache

func init() {
	metricsMap = map[string][]string{
		"AWS/ApiGateway":     {"4XXError", "5XXError", "CacheHitCount", "CacheMissCount", "Count", "IntegrationLatency", "Latency"},
		"AWS/ApplicationELB": {"ActiveConnectionCount", "ClientTLSNegotiationErrorCount", "HealthyHostCount", "HTTPCode_ELB_4XX_Count", "HTTPCode_ELB_5XX_Count", "HTTPCode_Target_2XX_Count", "HTTPCode_Target_3XX_Count", "HTTPCode_Target_4XX_Count", "HTTPCode_Target_5XX_Count", "IPv6ProcessedBytes", "IPv6RequestCount", "NewConnectionCount", "ProcessedBytes", "RejectedConnectionCount", "RequestCount", "TargetConnectionErrorCount", "TargetResponseTime", "TargetTLSNegotiationErrorCount", "UnHealthyHostCount"},
		"AWS/AutoScaling":    {"GroupMinSize", "GroupMaxSize", "GroupDesiredCapacity", "GroupInServiceInstances", "GroupPendingInstances", "GroupStandbyInstances", "GroupTerminatingInstances", "GroupTotalInstances"},
		"AWS/Billing":        {"EstimatedCharges"},
		"AWS/CloudFront":     {"Requests", "BytesDownloaded", "BytesUploaded", "TotalErrorRate", "4xxErrorRate", "5xxErrorRate"},
		"AWS/CloudSearch":    {"SuccessfulRequests", "SearchableDocuments", "IndexUtilization", "Partitions"},
		"AWS/DMS":            {"FreeableMemory", "WriteIOPS", "ReadIOPS", "WriteThroughput", "ReadThroughput", "WriteLatency", "ReadLatency", "SwapUsage", "NetworkTransmitThroughput", "NetworkReceiveThroughput", "FullLoadThroughputBandwidthSource", "FullLoadThroughputBandwidthTarget", "FullLoadThroughputRowsSource", "FullLoadThroughputRowsTarget", "CDCIncomingChanges", "CDCChangesMemorySource", "CDCChangesMemoryTarget", "CDCChangesDiskSource", "CDCChangesDiskTarget", "CDCThroughputBandwidthTarget", "CDCThroughputRowsSource", "CDCThroughputRowsTarget", "CDCLatencySource", "CDCLatencyTarget"},
		"AWS/DynamoDB":       {"ConditionalCheckFailedRequests", "ConsumedReadCapacityUnits", "ConsumedWriteCapacityUnits", "OnlineIndexConsumedWriteCapacity", "OnlineIndexPercentageProgress", "OnlineIndexThrottleEvents", "ProvisionedReadCapacityUnits", "ProvisionedWriteCapacityUnits", "ReadThrottleEvents", "ReturnedBytes", "ReturnedItemCount", "ReturnedRecordsCount", "SuccessfulRequestLatency", "SystemErrors", "TimeToLiveDeletedItemCount", "ThrottledRequests", "UserErrors", "WriteThrottleEvents"},
		"AWS/EBS":            {"VolumeReadBytes", "VolumeWriteBytes", "VolumeReadOps", "VolumeWriteOps", "VolumeTotalReadTime", "VolumeTotalWriteTime", "VolumeIdleTime", "VolumeQueueLength", "VolumeThroughputPercentage", "VolumeConsumedReadWriteOps", "BurstBalance"},
		"AWS/EC2":            {"CPUCreditUsage", "CPUCreditBalance", "CPUUtilization", "DiskReadOps", "DiskWriteOps", "DiskReadBytes", "DiskWriteBytes", "NetworkIn", "NetworkOut", "NetworkPacketsIn", "NetworkPacketsOut", "StatusCheckFailed", "StatusCheckFailed_Instance", "StatusCheckFailed_System"},
		"AWS/EC2Spot":        {"AvailableInstancePoolsCount", "BidsSubmittedForCapacity", "EligibleInstancePoolCount", "FulfilledCapacity", "MaxPercentCapacityAllocation", "PendingCapacity", "PercentCapacityAllocation", "TargetCapacity", "TerminatingCapacity"},
		"AWS/ECS":            {"CPUReservation", "MemoryReservation", "CPUUtilization", "MemoryUtilization"},
		"AWS/EFS":            {"BurstCreditBalance", "ClientConnections", "DataReadIOBytes", "DataWriteIOBytes", "MetadataIOBytes", "TotalIOBytes", "PermittedThroughput", "PercentIOLimit"},
		"AWS/ELB":            {"HealthyHostCount", "UnHealthyHostCount", "RequestCount", "Latency", "HTTPCode_ELB_4XX", "HTTPCode_ELB_5XX", "HTTPCode_Backend_2XX", "HTTPCode_Backend_3XX", "HTTPCode_Backend_4XX", "HTTPCode_Backend_5XX", "BackendConnectionErrors", "SurgeQueueLength", "SpilloverCount", "EstimatedALBActiveConnectionCount", "EstimatedALBConsumedLCUs", "EstimatedALBNewConnectionCount", "EstimatedProcessedBytes"},
		"AWS/ElastiCache": {
			"CPUUtilization", "FreeableMemory", "NetworkBytesIn", "NetworkBytesOut", "SwapUsage",
			"BytesUsedForCacheItems", "BytesReadIntoMemcached", "BytesWrittenOutFromMemcached", "CasBadval", "CasHits", "CasMisses", "CmdFlush", "CmdGet", "CmdSet", "CurrConnections", "CurrItems", "DecrHits", "DecrMisses", "DeleteHits", "DeleteMisses", "Evictions", "GetHits", "GetMisses", "IncrHits", "IncrMisses", "Reclaimed",
			"BytesUsedForHash", "CmdConfigGet", "CmdConfigSet", "CmdTouch", "CurrConfig", "EvictedUnfetched", "ExpiredUnfetched", "SlabsMoved", "TouchHits", "TouchMisses",
			"NewConnections", "NewItems", "UnusedMemory",
			"BytesUsedForCache", "CacheHits", "CacheMisses", "CurrConnections", "Evictions", "HyperLogLogBasedCmds", "NewConnections", "Reclaimed", "ReplicationBytes", "ReplicationLag", "SaveInProgress",
			"CurrItems", "GetTypeCmds", "HashBasedCmds", "KeyBasedCmds", "ListBasedCmds", "SetBasedCmds", "SetTypeCmds", "SortedSetBasedCmds", "StringBasedCmds",
		},
		"AWS/ElasticBeanstalk": {
			"EnvironmentHealth",
			"ApplicationLatencyP10", "ApplicationLatencyP50", "ApplicationLatencyP75", "ApplicationLatencyP85", "ApplicationLatencyP90", "ApplicationLatencyP95", "ApplicationLatencyP99", "ApplicationLatencyP99.9",
			"ApplicationRequests2xx", "ApplicationRequests3xx", "ApplicationRequests4xx", "ApplicationRequests5xx", "ApplicationRequestsTotal",
			"CPUIdle", "CPUIowait", "CPUIrq", "CPUNice", "CPUSoftirq", "CPUSystem", "CPUUser",
			"InstanceHealth", "InstancesDegraded", "InstancesInfo", "InstancesNoData", "InstancesOk", "InstancesPending", "InstancesSevere", "InstancesUnknown", "InstancesWarning",
			"LoadAverage1min", "LoadAverage5min",
			"RootFilesystemUtil",
		},
		"AWS/ElasticMapReduce": {"IsIdle", "JobsRunning", "JobsFailed",
			"MapTasksRunning", "MapTasksRemaining", "MapSlotsOpen", "RemainingMapTasksPerSlot", "ReduceTasksRunning", "ReduceTasksRemaining", "ReduceSlotsOpen",
			"CoreNodesRunning", "CoreNodesPending", "LiveDataNodes", "TaskNodesRunning", "TaskNodesPending", "LiveTaskTrackers",
			"S3BytesWritten", "S3BytesRead", "HDFSUtilization", "HDFSBytesRead", "HDFSBytesWritten", "MissingBlocks", "TotalLoad",
			"BackupFailed", "MostRecentBackupDuration", "TimeSinceLastSuccessfulBackup",
			"IsIdle", "ContainerAllocated", "ContainerReserved", "ContainerPending", "AppsCompleted", "AppsFailed", "AppsKilled", "AppsPending", "AppsRunning", "AppsSubmitted",
			"CoreNodesRunning", "CoreNodesPending", "LiveDataNodes", "MRTotalNodes", "MRActiveNodes", "MRLostNodes", "MRUnhealthyNodes", "MRDecommissionedNodes", "MRRebootedNodes",
			"S3BytesWritten", "S3BytesRead", "HDFSUtilization", "HDFSBytesRead", "HDFSBytesWritten", "MissingBlocks", "CorruptBlocks", "TotalLoad", "MemoryTotalMB", "MemoryReservedMB", "MemoryAvailableMB", "MemoryAllocatedMB", "PendingDeletionBlocks", "UnderReplicatedBlocks", "DfsPendingReplicationBlocks", "CapacityRemainingGB",
			"HbaseBackupFailed", "MostRecentBackupDuration", "TimeSinceLastSuccessfulBackup"},
		"AWS/ES":               {"ClusterStatus.green", "ClusterStatus.yellow", "ClusterStatus.red", "ClusterUsedSpace", "Nodes", "SearchableDocuments", "DeletedDocuments", "CPUCreditBalance", "CPUUtilization", "FreeStorageSpace", "JVMMemoryPressure", "AutomatedSnapshotFailure", "MasterCPUCreditBalance", "MasterCPUUtilization", "MasterFreeStorageSpace", "MasterJVMMemoryPressure", "ReadLatency", "WriteLatency", "ReadThroughput", "WriteThroughput", "DiskQueueDepth", "ReadIOPS", "WriteIOPS"},
		"AWS/Events":           {"Invocations", "FailedInvocations", "TriggeredRules", "MatchedEvents", "ThrottledRules"},
		"AWS/Firehose":         {"DeliveryToElasticsearch.Bytes", "DeliveryToElasticsearch.Records", "DeliveryToElasticsearch.Success", "DeliveryToRedshift.Bytes", "DeliveryToRedshift.Records", "DeliveryToRedshift.Success", "DeliveryToS3.Bytes", "DeliveryToS3.DataFreshness", "DeliveryToS3.Records", "DeliveryToS3.Success", "IncomingBytes", "IncomingRecords", "DescribeDeliveryStream.Latency", "DescribeDeliveryStream.Requests", "ListDeliveryStreams.Latency", "ListDeliveryStreams.Requests", "PutRecord.Bytes", "PutRecord.Latency", "PutRecord.Requests", "PutRecordBatch.Bytes", "PutRecordBatch.Latency", "PutRecordBatch.Records", "PutRecordBatch.Requests", "UpdateDeliveryStream.Latency", "UpdateDeliveryStream.Requests"},
		"AWS/IoT":              {"PublishIn.Success", "PublishOut.Success", "Subscribe.Success", "Ping.Success", "Connect.Success", "GetThingShadow.Accepted"},
		"AWS/Kinesis":          {"GetRecords.Bytes", "GetRecords.IteratorAge", "GetRecords.IteratorAgeMilliseconds", "GetRecords.Latency", "GetRecords.Records", "GetRecords.Success", "IncomingBytes", "IncomingRecords", "PutRecord.Bytes", "PutRecord.Latency", "PutRecord.Success", "PutRecords.Bytes", "PutRecords.Latency", "PutRecords.Records", "PutRecords.Success", "ReadProvisionedThroughputExceeded", "WriteProvisionedThroughputExceeded", "IteratorAgeMilliseconds", "OutgoingBytes", "OutgoingRecords"},
		"AWS/KinesisAnalytics": {"Bytes", "MillisBehindLatest", "Records", "Success"},
		"AWS/Lambda":           {"Invocations", "Errors", "Duration", "Throttles", "IteratorAge"},
		"AWS/Logs":             {"IncomingBytes", "IncomingLogEvents", "ForwardedBytes", "ForwardedLogEvents", "DeliveryErrors", "DeliveryThrottling"},
		"AWS/ML":               {"PredictCount", "PredictFailureCount"},
		"AWS/NATGateway":       {"PacketsOutToDestination", "PacketsOutToSource", "PacketsInFromSource", "PacketsInFromDestination", "BytesOutToDestination", "BytesOutToSource", "BytesInFromSource", "BytesInFromDestination", "ErrorPortAllocation", "ActiveConnectionCount", "ConnectionAttemptCount", "ConnectionEstablishedCount", "IdleTimeoutCount", "PacketsDropCount"},
		"AWS/OpsWorks":         {"cpu_idle", "cpu_nice", "cpu_system", "cpu_user", "cpu_waitio", "load_1", "load_5", "load_15", "memory_buffers", "memory_cached", "memory_free", "memory_swap", "memory_total", "memory_used", "procs"},
		"AWS/Redshift":         {"CPUUtilization", "DatabaseConnections", "HealthStatus", "MaintenanceMode", "NetworkReceiveThroughput", "NetworkTransmitThroughput", "PercentageDiskSpaceUsed", "ReadIOPS", "ReadLatency", "ReadThroughput", "WriteIOPS", "WriteLatency", "WriteThroughput"},
		"AWS/RDS":              {"ActiveTransactions", "AuroraBinlogReplicaLag", "AuroraReplicaLag", "AuroraReplicaLagMaximum", "AuroraReplicaLagMinimum", "BinLogDiskUsage", "BlockedTransactions", "BufferCacheHitRatio", "CommitLatency", "CommitThroughput", "BinLogDiskUsage", "CPUCreditBalance", "CPUCreditUsage", "CPUUtilization", "DatabaseConnections", "DDLLatency", "DDLThroughput", "Deadlocks", "DeleteLatency", "DeleteThroughput", "DiskQueueDepth", "DMLLatency", "DMLThroughput", "EngineUptime", "FailedSqlStatements", "FreeableMemory", "FreeLocalStorage", "FreeStorageSpace", "InsertLatency", "InsertThroughput", "LoginFailures", "NetworkReceiveThroughput", "NetworkTransmitThroughput", "NetworkThroughput", "Queries", "ReadIOPS", "ReadLatency", "ReadThroughput", "ReplicaLag", "ResultSetCacheHitRatio", "SelectLatency", "SelectThroughput", "SwapUsage", "TotalConnections", "UpdateLatency", "UpdateThroughput", "VolumeBytesUsed", "VolumeReadIOPS", "VolumeWriteIOPS", "WriteIOPS", "WriteLatency", "WriteThroughput"},
		"AWS/Route53":          {"ChildHealthCheckHealthyCount", "HealthCheckStatus", "HealthCheckPercentageHealthy", "ConnectionTime", "SSLHandshakeTime", "TimeToFirstByte"},
		"AWS/S3":               {"BucketSizeBytes", "NumberOfObjects", "AllRequests", "GetRequests", "PutRequests", "DeleteRequests", "HeadRequests", "PostRequests", "ListRequests", "BytesDownloaded", "BytesUploaded", "4xxErrors", "5xxErrors", "FirstByteLatency", "TotalRequestLatency"},
		"AWS/SES":              {"Bounce", "Complaint", "Delivery", "Reject", "Send"},
		"AWS/SNS":              {"NumberOfMessagesPublished", "PublishSize", "NumberOfNotificationsDelivered", "NumberOfNotificationsFailed"},
		"AWS/SQS":              {"NumberOfMessagesSent", "SentMessageSize", "NumberOfMessagesReceived", "NumberOfEmptyReceives", "NumberOfMessagesDeleted", "ApproximateAgeOfOldestMessage", "ApproximateNumberOfMessagesDelayed", "ApproximateNumberOfMessagesVisible", "ApproximateNumberOfMessagesNotVisible"},
		"AWS/StorageGateway": {"CacheHitPercent", "CachePercentUsed", "CachePercentDirty", "CloudBytesDownloaded", "CloudDownloadLatency", "CloudBytesUploaded", "UploadBufferFree", "UploadBufferPercentUsed", "UploadBufferUsed", "QueuedWrites", "ReadBytes", "ReadTime", "TotalCacheSize", "WriteBytes", "WriteTime", "TimeSinceLastRecoveryPoint", "WorkingStorageFree", "WorkingStoragePercentUsed", "WorkingStorageUsed",
			"CacheHitPercent", "CachePercentUsed", "CachePercentDirty", "ReadBytes", "ReadTime", "WriteBytes", "WriteTime", "QueuedWrites"},
		"AWS/SWF": {"DecisionTaskScheduleToStartTime", "DecisionTaskStartToCloseTime", "DecisionTasksCompleted", "StartedDecisionTasksTimedOutOnClose", "WorkflowStartToCloseTime", "WorkflowsCanceled", "WorkflowsCompleted", "WorkflowsContinuedAsNew", "WorkflowsFailed", "WorkflowsTerminated", "WorkflowsTimedOut",
			"ActivityTaskScheduleToCloseTime", "ActivityTaskScheduleToStartTime", "ActivityTaskStartToCloseTime", "ActivityTasksCanceled", "ActivityTasksCompleted", "ActivityTasksFailed", "ScheduledActivityTasksTimedOutOnClose", "ScheduledActivityTasksTimedOutOnStart", "StartedActivityTasksTimedOutOnClose", "StartedActivityTasksTimedOutOnHeartbeat"},
		"AWS/VPN":        {"TunnelState", "TunnelDataIn", "TunnelDataOut"},
		"WAF":            {"AllowedRequests", "BlockedRequests", "CountedRequests"},
		"AWS/WorkSpaces": {"Available", "Unhealthy", "ConnectionAttempt", "ConnectionSuccess", "ConnectionFailure", "SessionLaunchTime", "InSessionLatency", "SessionDisconnect"},
		"KMS":            {"SecondsUntilKeyMaterialExpiration"},
	}
	dimensionsMap = map[string][]string{
		"AWS/ApiGateway":       {"ApiName", "Method", "Resource", "Stage"},
		"AWS/ApplicationELB":   {"LoadBalancer", "TargetGroup", "AvailabilityZone"},
		"AWS/AutoScaling":      {"AutoScalingGroupName"},
		"AWS/Billing":          {"ServiceName", "LinkedAccount", "Currency"},
		"AWS/CloudFront":       {"DistributionId", "Region"},
		"AWS/CloudSearch":      {},
		"AWS/DMS":              {"ReplicationInstanceIdentifier", "ReplicationTaskIdentifier"},
		"AWS/DynamoDB":         {"TableName", "GlobalSecondaryIndexName", "Operation", "StreamLabel"},
		"AWS/EBS":              {"VolumeId"},
		"AWS/EC2":              {"AutoScalingGroupName", "ImageId", "InstanceId", "InstanceType"},
		"AWS/EC2Spot":          {"AvailabilityZone", "FleetRequestId", "InstanceType"},
		"AWS/ECS":              {"ClusterName", "ServiceName"},
		"AWS/EFS":              {"FileSystemId"},
		"AWS/ELB":              {"LoadBalancerName", "AvailabilityZone"},
		"AWS/ElastiCache":      {"CacheClusterId", "CacheNodeId"},
		"AWS/ElasticBeanstalk": {"EnvironmentName", "InstanceId"},
		"AWS/ElasticMapReduce": {"ClusterId", "JobFlowId", "JobId"},
		"AWS/ES":               {"ClientId", "DomainName"},
		"AWS/Events":           {"RuleName"},
		"AWS/Firehose":         {"DeliveryStreamName"},
		"AWS/IoT":              {"Protocol"},
		"AWS/Kinesis":          {"StreamName", "ShardID"},
		"AWS/KinesisAnalytics": {"Flow", "Id", "Application"},
		"AWS/Lambda":           {"FunctionName", "Resource", "Version", "Alias"},
		"AWS/Logs":             {"LogGroupName", "DestinationType", "FilterName"},
		"AWS/ML":               {"MLModelId", "RequestMode"},
		"AWS/NATGateway":       {"NatGatewayId"},
		"AWS/OpsWorks":         {"StackId", "LayerId", "InstanceId"},
		"AWS/Redshift":         {"NodeID", "ClusterIdentifier"},
		"AWS/RDS":              {"DBInstanceIdentifier", "DBClusterIdentifier", "DbClusterIdentifier", "DatabaseClass", "EngineName", "Role"},
		"AWS/Route53":          {"HealthCheckId", "Region"},
		"AWS/S3":               {"BucketName", "StorageType", "FilterId"},
		"AWS/SES":              {},
		"AWS/SNS":              {"Application", "Platform", "TopicName"},
		"AWS/SQS":              {"QueueName"},
		"AWS/StorageGateway":   {"GatewayId", "GatewayName", "VolumeId"},
		"AWS/SWF":              {"Domain", "WorkflowTypeName", "WorkflowTypeVersion", "ActivityTypeName", "ActivityTypeVersion"},
		"AWS/VPN":              {"VpnId", "TunnelIpAddress"},
		"WAF":                  {"Rule", "WebACL"},
		"AWS/WorkSpaces":       {"DirectoryId", "WorkspaceId"},
		"KMS":                  {"KeyId"},
	}

	customMetricsMetricsMap = make(map[string]map[string]map[string]*CustomMetricsCache)
	customMetricsDimensionsMap = make(map[string]map[string]map[string]*CustomMetricsCache)
}

func (e *CloudWatchExecutor) executeMetricFindQuery(ctx context.Context, queries tsdb.QuerySlice, queryContext *tsdb.QueryContext) *tsdb.BatchResult {
	result := &tsdb.BatchResult{
		QueryResults: make(map[string]*tsdb.QueryResult),
	}
	queryResult := &tsdb.QueryResult{Meta: simplejson.New(), RefId: queries[0].RefId}

	parameters := queries[0].Model.Get("parameters")
	subType := queries[0].Model.Get("subtype").MustString()
	var data []suggestData
	var err error
	switch subType {
	case "regions":
		data, err = e.handleGetRegions(ctx, parameters, queryContext)
		break
	case "namespaces":
		data, err = e.handleGetNamespaces(ctx, parameters, queryContext)
		break
	case "metrics":
		data, err = e.handleGetMetrics(ctx, parameters, queryContext)
		break
	case "dimension_keys":
		data, err = e.handleGetDimensions(ctx, parameters, queryContext)
		break
	}
	if err != nil {
		queryResult.Error = err
	}
	transformToTable(data, queryResult)
	result.QueryResults[queries[0].RefId] = queryResult
	return result
}

func transformToTable(data []suggestData, result *tsdb.QueryResult) {
	table := &tsdb.Table{
		Columns: make([]tsdb.TableColumn, 2),
		Rows:    make([]tsdb.RowValues, 0),
	}
	table.Columns[0].Text = "text"
	table.Columns[1].Text = "value"

	for _, r := range data {
		values := make([]interface{}, 2)
		values[0] = r.Text
		values[1] = r.Value
		table.Rows = append(table.Rows, values)
	}
	result.Tables = append(result.Tables, table)
	result.Meta.Set("rowCount", len(data))
}

func (e *CloudWatchExecutor) getDsInfo(region string) *cwapi.DatasourceInfo {
	assumeRoleArn := e.DataSource.JsonData.Get("assumeRoleArn").MustString()
	accessKey := ""
	secretKey := ""
	for key, value := range e.DataSource.SecureJsonData.Decrypt() {
		if key == "accessKey" {
			accessKey = value
		}
		if key == "secretKey" {
			secretKey = value
		}
	}

	datasourceInfo := &cwapi.DatasourceInfo{
		Region:        region,
		Profile:       e.DataSource.Database,
		AssumeRoleArn: assumeRoleArn,
		AccessKey:     accessKey,
		SecretKey:     secretKey,
	}

	return datasourceInfo
}

// Whenever this list is updated, frontend list should also be updated.
// Please update the region list in public/app/plugins/datasource/cloudwatch/partials/config.html
func (e *CloudWatchExecutor) handleGetRegions(ctx context.Context, parameters *simplejson.Json, queryContext *tsdb.QueryContext) ([]suggestData, error) {
	regions := []string{
		"ap-northeast-1", "ap-northeast-2", "ap-southeast-1", "ap-southeast-2", "ap-south-1", "ca-central-1", "cn-north-1",
		"eu-central-1", "eu-west-1", "eu-west-2", "sa-east-1", "us-east-1", "us-east-2", "us-gov-west-1", "us-west-1", "us-west-2",
	}

	result := make([]suggestData, 0)
	for _, region := range regions {
		result = append(result, suggestData{Text: region, Value: region})
	}

	return result, nil
}

func (e *CloudWatchExecutor) handleGetNamespaces(ctx context.Context, parameters *simplejson.Json, queryContext *tsdb.QueryContext) ([]suggestData, error) {
	keys := []string{}
	for key := range metricsMap {
		keys = append(keys, key)
	}

	customNamespaces := e.DataSource.JsonData.Get("customMetricsNamespaces").MustString()
	if customNamespaces != "" {
		keys = append(keys, strings.Split(customNamespaces, ",")...)
	}

	sort.Sort(sort.StringSlice(keys))

	result := make([]suggestData, 0)
	for _, key := range keys {
		result = append(result, suggestData{Text: key, Value: key})
	}

	return result, nil
}

func (e *CloudWatchExecutor) handleGetMetrics(ctx context.Context, parameters *simplejson.Json, queryContext *tsdb.QueryContext) ([]suggestData, error) {
	region := parameters.Get("region").MustString()
	namespace := parameters.Get("namespace").MustString()

	var namespaceMetrics []string
	if !isCustomMetrics(namespace) {
		var exists bool
		if namespaceMetrics, exists = metricsMap[namespace]; !exists {
			return nil, errors.New("Unable to find namespace " + namespace)
		}
	} else {
		var err error
		dsInfo := e.getDsInfo(region)
		dsInfo.Namespace = namespace

		if namespaceMetrics, err = getMetricsForCustomMetrics(dsInfo, getAllMetrics); err != nil {
			return nil, errors.New("Unable to call AWS API")
		}
	}
	sort.Sort(sort.StringSlice(namespaceMetrics))

	result := make([]suggestData, 0)
	for _, name := range namespaceMetrics {
		result = append(result, suggestData{Text: name, Value: name})
	}

	return result, nil
}

func (e *CloudWatchExecutor) handleGetDimensions(ctx context.Context, parameters *simplejson.Json, queryContext *tsdb.QueryContext) ([]suggestData, error) {
	region := parameters.Get("region").MustString()
	namespace := parameters.Get("namespace").MustString()

	var dimensionValues []string
	if !isCustomMetrics(namespace) {
		var exists bool
		if dimensionValues, exists = dimensionsMap[namespace]; !exists {
			return nil, errors.New("Unable to find dimension " + namespace)
		}
	} else {
		var err error
		dsInfo := e.getDsInfo(region)
		dsInfo.Namespace = namespace

		if dimensionValues, err = getDimensionsForCustomMetrics(dsInfo, getAllMetrics); err != nil {
			return nil, errors.New("Unable to call AWS API")
		}
	}
	sort.Sort(sort.StringSlice(dimensionValues))

	result := make([]suggestData, 0)
	for _, name := range dimensionValues {
		result = append(result, suggestData{Text: name, Value: name})
	}

	return result, nil
}

func getAllMetrics(cwData *cwapi.DatasourceInfo) (cloudwatch.ListMetricsOutput, error) {
	creds, err := cwapi.GetCredentials(cwData)
	if err != nil {
		return cloudwatch.ListMetricsOutput{}, err
	}
	cfg := &aws.Config{
		Region:      aws.String(cwData.Region),
		Credentials: creds,
	}
	sess, err := session.NewSession(cfg)
	if err != nil {
		return cloudwatch.ListMetricsOutput{}, err
	}
	svc := cloudwatch.New(sess, cfg)

	params := &cloudwatch.ListMetricsInput{
		Namespace: aws.String(cwData.Namespace),
	}

	var resp cloudwatch.ListMetricsOutput
	err = svc.ListMetricsPages(params,
		func(page *cloudwatch.ListMetricsOutput, lastPage bool) bool {
			metrics.M_Aws_CloudWatch_ListMetrics.Inc(1)
			metrics, _ := awsutil.ValuesAtPath(page, "Metrics")
			for _, metric := range metrics {
				resp.Metrics = append(resp.Metrics, metric.(*cloudwatch.Metric))
			}
			return !lastPage
		})
	if err != nil {
		return resp, err
	}

	return resp, nil
}

var metricsCacheLock sync.Mutex

func getMetricsForCustomMetrics(dsInfo *cwapi.DatasourceInfo, getAllMetrics func(*cwapi.DatasourceInfo) (cloudwatch.ListMetricsOutput, error)) ([]string, error) {
	metricsCacheLock.Lock()
	defer metricsCacheLock.Unlock()

	if _, ok := customMetricsMetricsMap[dsInfo.Profile]; !ok {
		customMetricsMetricsMap[dsInfo.Profile] = make(map[string]map[string]*CustomMetricsCache)
	}
	if _, ok := customMetricsMetricsMap[dsInfo.Profile][dsInfo.Region]; !ok {
		customMetricsMetricsMap[dsInfo.Profile][dsInfo.Region] = make(map[string]*CustomMetricsCache)
	}
	if _, ok := customMetricsMetricsMap[dsInfo.Profile][dsInfo.Region][dsInfo.Namespace]; !ok {
		customMetricsMetricsMap[dsInfo.Profile][dsInfo.Region][dsInfo.Namespace] = &CustomMetricsCache{}
		customMetricsMetricsMap[dsInfo.Profile][dsInfo.Region][dsInfo.Namespace].Cache = make([]string, 0)
	}

	if customMetricsMetricsMap[dsInfo.Profile][dsInfo.Region][dsInfo.Namespace].Expire.After(time.Now()) {
		return customMetricsMetricsMap[dsInfo.Profile][dsInfo.Region][dsInfo.Namespace].Cache, nil
	}
	result, err := getAllMetrics(dsInfo)
	if err != nil {
		return []string{}, err
	}
	customMetricsMetricsMap[dsInfo.Profile][dsInfo.Region][dsInfo.Namespace].Cache = make([]string, 0)
	customMetricsMetricsMap[dsInfo.Profile][dsInfo.Region][dsInfo.Namespace].Expire = time.Now().Add(5 * time.Minute)

	for _, metric := range result.Metrics {
		if isDuplicate(customMetricsMetricsMap[dsInfo.Profile][dsInfo.Region][dsInfo.Namespace].Cache, *metric.MetricName) {
			continue
		}
		customMetricsMetricsMap[dsInfo.Profile][dsInfo.Region][dsInfo.Namespace].Cache = append(customMetricsMetricsMap[dsInfo.Profile][dsInfo.Region][dsInfo.Namespace].Cache, *metric.MetricName)
	}

	return customMetricsMetricsMap[dsInfo.Profile][dsInfo.Region][dsInfo.Namespace].Cache, nil
}

var dimensionsCacheLock sync.Mutex

func getDimensionsForCustomMetrics(dsInfo *cwapi.DatasourceInfo, getAllMetrics func(*cwapi.DatasourceInfo) (cloudwatch.ListMetricsOutput, error)) ([]string, error) {
	dimensionsCacheLock.Lock()
	defer dimensionsCacheLock.Unlock()

	if _, ok := customMetricsDimensionsMap[dsInfo.Profile]; !ok {
		customMetricsDimensionsMap[dsInfo.Profile] = make(map[string]map[string]*CustomMetricsCache)
	}
	if _, ok := customMetricsDimensionsMap[dsInfo.Profile][dsInfo.Region]; !ok {
		customMetricsDimensionsMap[dsInfo.Profile][dsInfo.Region] = make(map[string]*CustomMetricsCache)
	}
	if _, ok := customMetricsDimensionsMap[dsInfo.Profile][dsInfo.Region][dsInfo.Namespace]; !ok {
		customMetricsDimensionsMap[dsInfo.Profile][dsInfo.Region][dsInfo.Namespace] = &CustomMetricsCache{}
		customMetricsDimensionsMap[dsInfo.Profile][dsInfo.Region][dsInfo.Namespace].Cache = make([]string, 0)
	}

	if customMetricsDimensionsMap[dsInfo.Profile][dsInfo.Region][dsInfo.Namespace].Expire.After(time.Now()) {
		return customMetricsDimensionsMap[dsInfo.Profile][dsInfo.Region][dsInfo.Namespace].Cache, nil
	}
	result, err := getAllMetrics(dsInfo)
	if err != nil {
		return []string{}, err
	}
	customMetricsDimensionsMap[dsInfo.Profile][dsInfo.Region][dsInfo.Namespace].Cache = make([]string, 0)
	customMetricsDimensionsMap[dsInfo.Profile][dsInfo.Region][dsInfo.Namespace].Expire = time.Now().Add(5 * time.Minute)

	for _, metric := range result.Metrics {
		for _, dimension := range metric.Dimensions {
			if isDuplicate(customMetricsDimensionsMap[dsInfo.Profile][dsInfo.Region][dsInfo.Namespace].Cache, *dimension.Name) {
				continue
			}
			customMetricsDimensionsMap[dsInfo.Profile][dsInfo.Region][dsInfo.Namespace].Cache = append(customMetricsDimensionsMap[dsInfo.Profile][dsInfo.Region][dsInfo.Namespace].Cache, *dimension.Name)
		}
	}

	return customMetricsDimensionsMap[dsInfo.Profile][dsInfo.Region][dsInfo.Namespace].Cache, nil
}

func isDuplicate(nameList []string, target string) bool {
	for _, name := range nameList {
		if name == target {
			return true
		}
	}
	return false
}

func isCustomMetrics(namespace string) bool {
	return strings.Index(namespace, "AWS/") != 0
}
