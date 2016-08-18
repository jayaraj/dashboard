// THIS FILE IS AUTOMATICALLY GENERATED. DO NOT EDIT.

// Package swfiface provides an interface for the Amazon Simple Workflow Service.
package swfiface

import (
	"github.com/aws/aws-sdk-go/aws/request"
	"github.com/aws/aws-sdk-go/service/swf"
)

// SWFAPI is the interface type for swf.SWF.
type SWFAPI interface {
	CountClosedWorkflowExecutionsRequest(*swf.CountClosedWorkflowExecutionsInput) (*request.Request, *swf.WorkflowExecutionCount)

	CountClosedWorkflowExecutions(*swf.CountClosedWorkflowExecutionsInput) (*swf.WorkflowExecutionCount, error)

	CountOpenWorkflowExecutionsRequest(*swf.CountOpenWorkflowExecutionsInput) (*request.Request, *swf.WorkflowExecutionCount)

	CountOpenWorkflowExecutions(*swf.CountOpenWorkflowExecutionsInput) (*swf.WorkflowExecutionCount, error)

	CountPendingActivityTasksRequest(*swf.CountPendingActivityTasksInput) (*request.Request, *swf.PendingTaskCount)

	CountPendingActivityTasks(*swf.CountPendingActivityTasksInput) (*swf.PendingTaskCount, error)

	CountPendingDecisionTasksRequest(*swf.CountPendingDecisionTasksInput) (*request.Request, *swf.PendingTaskCount)

	CountPendingDecisionTasks(*swf.CountPendingDecisionTasksInput) (*swf.PendingTaskCount, error)

	DeprecateActivityTypeRequest(*swf.DeprecateActivityTypeInput) (*request.Request, *swf.DeprecateActivityTypeOutput)

	DeprecateActivityType(*swf.DeprecateActivityTypeInput) (*swf.DeprecateActivityTypeOutput, error)

	DeprecateDomainRequest(*swf.DeprecateDomainInput) (*request.Request, *swf.DeprecateDomainOutput)

	DeprecateDomain(*swf.DeprecateDomainInput) (*swf.DeprecateDomainOutput, error)

	DeprecateWorkflowTypeRequest(*swf.DeprecateWorkflowTypeInput) (*request.Request, *swf.DeprecateWorkflowTypeOutput)

	DeprecateWorkflowType(*swf.DeprecateWorkflowTypeInput) (*swf.DeprecateWorkflowTypeOutput, error)

	DescribeActivityTypeRequest(*swf.DescribeActivityTypeInput) (*request.Request, *swf.DescribeActivityTypeOutput)

	DescribeActivityType(*swf.DescribeActivityTypeInput) (*swf.DescribeActivityTypeOutput, error)

	DescribeDomainRequest(*swf.DescribeDomainInput) (*request.Request, *swf.DescribeDomainOutput)

	DescribeDomain(*swf.DescribeDomainInput) (*swf.DescribeDomainOutput, error)

	DescribeWorkflowExecutionRequest(*swf.DescribeWorkflowExecutionInput) (*request.Request, *swf.DescribeWorkflowExecutionOutput)

	DescribeWorkflowExecution(*swf.DescribeWorkflowExecutionInput) (*swf.DescribeWorkflowExecutionOutput, error)

	DescribeWorkflowTypeRequest(*swf.DescribeWorkflowTypeInput) (*request.Request, *swf.DescribeWorkflowTypeOutput)

	DescribeWorkflowType(*swf.DescribeWorkflowTypeInput) (*swf.DescribeWorkflowTypeOutput, error)

	GetWorkflowExecutionHistoryRequest(*swf.GetWorkflowExecutionHistoryInput) (*request.Request, *swf.GetWorkflowExecutionHistoryOutput)

	GetWorkflowExecutionHistory(*swf.GetWorkflowExecutionHistoryInput) (*swf.GetWorkflowExecutionHistoryOutput, error)

	GetWorkflowExecutionHistoryPages(*swf.GetWorkflowExecutionHistoryInput, func(*swf.GetWorkflowExecutionHistoryOutput, bool) bool) error

	ListActivityTypesRequest(*swf.ListActivityTypesInput) (*request.Request, *swf.ListActivityTypesOutput)

	ListActivityTypes(*swf.ListActivityTypesInput) (*swf.ListActivityTypesOutput, error)

	ListActivityTypesPages(*swf.ListActivityTypesInput, func(*swf.ListActivityTypesOutput, bool) bool) error

	ListClosedWorkflowExecutionsRequest(*swf.ListClosedWorkflowExecutionsInput) (*request.Request, *swf.WorkflowExecutionInfos)

	ListClosedWorkflowExecutions(*swf.ListClosedWorkflowExecutionsInput) (*swf.WorkflowExecutionInfos, error)

	ListClosedWorkflowExecutionsPages(*swf.ListClosedWorkflowExecutionsInput, func(*swf.WorkflowExecutionInfos, bool) bool) error

	ListDomainsRequest(*swf.ListDomainsInput) (*request.Request, *swf.ListDomainsOutput)

	ListDomains(*swf.ListDomainsInput) (*swf.ListDomainsOutput, error)

	ListDomainsPages(*swf.ListDomainsInput, func(*swf.ListDomainsOutput, bool) bool) error

	ListOpenWorkflowExecutionsRequest(*swf.ListOpenWorkflowExecutionsInput) (*request.Request, *swf.WorkflowExecutionInfos)

	ListOpenWorkflowExecutions(*swf.ListOpenWorkflowExecutionsInput) (*swf.WorkflowExecutionInfos, error)

	ListOpenWorkflowExecutionsPages(*swf.ListOpenWorkflowExecutionsInput, func(*swf.WorkflowExecutionInfos, bool) bool) error

	ListWorkflowTypesRequest(*swf.ListWorkflowTypesInput) (*request.Request, *swf.ListWorkflowTypesOutput)

	ListWorkflowTypes(*swf.ListWorkflowTypesInput) (*swf.ListWorkflowTypesOutput, error)

	ListWorkflowTypesPages(*swf.ListWorkflowTypesInput, func(*swf.ListWorkflowTypesOutput, bool) bool) error

	PollForActivityTaskRequest(*swf.PollForActivityTaskInput) (*request.Request, *swf.PollForActivityTaskOutput)

	PollForActivityTask(*swf.PollForActivityTaskInput) (*swf.PollForActivityTaskOutput, error)

	PollForDecisionTaskRequest(*swf.PollForDecisionTaskInput) (*request.Request, *swf.PollForDecisionTaskOutput)

	PollForDecisionTask(*swf.PollForDecisionTaskInput) (*swf.PollForDecisionTaskOutput, error)

	PollForDecisionTaskPages(*swf.PollForDecisionTaskInput, func(*swf.PollForDecisionTaskOutput, bool) bool) error

	RecordActivityTaskHeartbeatRequest(*swf.RecordActivityTaskHeartbeatInput) (*request.Request, *swf.RecordActivityTaskHeartbeatOutput)

	RecordActivityTaskHeartbeat(*swf.RecordActivityTaskHeartbeatInput) (*swf.RecordActivityTaskHeartbeatOutput, error)

	RegisterActivityTypeRequest(*swf.RegisterActivityTypeInput) (*request.Request, *swf.RegisterActivityTypeOutput)

	RegisterActivityType(*swf.RegisterActivityTypeInput) (*swf.RegisterActivityTypeOutput, error)

	RegisterDomainRequest(*swf.RegisterDomainInput) (*request.Request, *swf.RegisterDomainOutput)

	RegisterDomain(*swf.RegisterDomainInput) (*swf.RegisterDomainOutput, error)

	RegisterWorkflowTypeRequest(*swf.RegisterWorkflowTypeInput) (*request.Request, *swf.RegisterWorkflowTypeOutput)

	RegisterWorkflowType(*swf.RegisterWorkflowTypeInput) (*swf.RegisterWorkflowTypeOutput, error)

	RequestCancelWorkflowExecutionRequest(*swf.RequestCancelWorkflowExecutionInput) (*request.Request, *swf.RequestCancelWorkflowExecutionOutput)

	RequestCancelWorkflowExecution(*swf.RequestCancelWorkflowExecutionInput) (*swf.RequestCancelWorkflowExecutionOutput, error)

	RespondActivityTaskCanceledRequest(*swf.RespondActivityTaskCanceledInput) (*request.Request, *swf.RespondActivityTaskCanceledOutput)

	RespondActivityTaskCanceled(*swf.RespondActivityTaskCanceledInput) (*swf.RespondActivityTaskCanceledOutput, error)

	RespondActivityTaskCompletedRequest(*swf.RespondActivityTaskCompletedInput) (*request.Request, *swf.RespondActivityTaskCompletedOutput)

	RespondActivityTaskCompleted(*swf.RespondActivityTaskCompletedInput) (*swf.RespondActivityTaskCompletedOutput, error)

	RespondActivityTaskFailedRequest(*swf.RespondActivityTaskFailedInput) (*request.Request, *swf.RespondActivityTaskFailedOutput)

	RespondActivityTaskFailed(*swf.RespondActivityTaskFailedInput) (*swf.RespondActivityTaskFailedOutput, error)

	RespondDecisionTaskCompletedRequest(*swf.RespondDecisionTaskCompletedInput) (*request.Request, *swf.RespondDecisionTaskCompletedOutput)

	RespondDecisionTaskCompleted(*swf.RespondDecisionTaskCompletedInput) (*swf.RespondDecisionTaskCompletedOutput, error)

	SignalWorkflowExecutionRequest(*swf.SignalWorkflowExecutionInput) (*request.Request, *swf.SignalWorkflowExecutionOutput)

	SignalWorkflowExecution(*swf.SignalWorkflowExecutionInput) (*swf.SignalWorkflowExecutionOutput, error)

	StartWorkflowExecutionRequest(*swf.StartWorkflowExecutionInput) (*request.Request, *swf.StartWorkflowExecutionOutput)

	StartWorkflowExecution(*swf.StartWorkflowExecutionInput) (*swf.StartWorkflowExecutionOutput, error)

	TerminateWorkflowExecutionRequest(*swf.TerminateWorkflowExecutionInput) (*request.Request, *swf.TerminateWorkflowExecutionOutput)

	TerminateWorkflowExecution(*swf.TerminateWorkflowExecutionInput) (*swf.TerminateWorkflowExecutionOutput, error)
}

var _ SWFAPI = (*swf.SWF)(nil)
