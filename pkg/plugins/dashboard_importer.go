package plugins

import (
	"fmt"
	"reflect"
	"regexp"

	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/components/simplejson"
	"github.com/grafana/grafana/pkg/log"
	m "github.com/grafana/grafana/pkg/models"
)

type ImportDashboardCommand struct {
	Path   string                 `json:"string"`
	Inputs []ImportDashboardInput `json:"inputs"`

	OrgId    int64  `json:"-"`
	UserId   int64  `json:"-"`
	PluginId string `json:"-"`
	Result   *PluginDashboardInfoDTO
}

type ImportDashboardInput struct {
	Type     string `json:"type"`
	PluginId string `json:"pluginId"`
	Name     string `json:"name"`
	Value    string `json:"value"`
}

type DashboardInputMissingError struct {
	VariableName string
}

func (e DashboardInputMissingError) Error() string {
	return fmt.Sprintf("Dashbord input variable: %v missing from import command", e.VariableName)
}

func init() {
	bus.AddHandler("plugins", ImportDashboard)
}

func ImportDashboard(cmd *ImportDashboardCommand) error {
	plugin, exists := Plugins[cmd.PluginId]

	if !exists {
		return PluginNotFoundError{cmd.PluginId}
	}

	var dashboard *m.Dashboard
	var err error

	if dashboard, err = loadPluginDashboard(plugin, cmd.Path); err != nil {
		return err
	}

	evaluator := &DashTemplateEvaluator{
		template: dashboard.Data,
		inputs:   cmd.Inputs,
	}

	generatedDash, err := evaluator.Eval()
	if err != nil {
		return err
	}

	saveCmd := m.SaveDashboardCommand{
		Dashboard: generatedDash,
		OrgId:     cmd.OrgId,
		UserId:    cmd.UserId,
	}

	if err := bus.Dispatch(&saveCmd); err != nil {
		return err
	}

	cmd.Result = &PluginDashboardInfoDTO{
		PluginId:          cmd.PluginId,
		Title:             dashboard.Title,
		Path:              cmd.Path,
		Revision:          dashboard.GetString("revision", "1.0"),
		InstalledUri:      "db/" + saveCmd.Result.Slug,
		InstalledRevision: dashboard.GetString("revision", "1.0"),
		Installed:         true,
	}

	return nil
}

type DashTemplateEvaluator struct {
	template  *simplejson.Json
	inputs    []ImportDashboardInput
	variables map[string]string
	result    *simplejson.Json
	varRegex  *regexp.Regexp
}

func (this *DashTemplateEvaluator) findInput(varName string, varDef *simplejson.Json) *ImportDashboardInput {
	inputType := varDef.Get("type").MustString()

	for _, input := range this.inputs {
		if inputType == input.Type && (input.Name == varName || input.Name == "*") {
			return &input
		}
	}

	return nil
}

func (this *DashTemplateEvaluator) Eval() (*simplejson.Json, error) {
	this.result = simplejson.New()
	this.variables = make(map[string]string)
	this.varRegex, _ = regexp.Compile("\\$__(\\w+)")

	// check that we have all inputs we need
	if inputDefs := this.template.Get("__inputs"); inputDefs != nil {
		for varName, value := range inputDefs.MustMap() {
			input := this.findInput(varName, simplejson.NewFromAny(value))

			if input == nil {
				return nil, &DashboardInputMissingError{VariableName: varName}
			}

			this.variables["$__"+varName] = input.Value
		}
	} else {
		log.Info("Import: dashboard has no __import section")
	}

	this.EvalObject(this.template, this.result)
	return this.result, nil
}

func (this *DashTemplateEvaluator) EvalObject(source *simplejson.Json, writer *simplejson.Json) {

	for key, value := range source.MustMap() {
		if key == "__inputs" {
			continue
		}

		switch v := value.(type) {
		case string:
			interpolated := this.varRegex.ReplaceAllStringFunc(v, func(match string) string {
				return this.variables[match]
			})
			writer.Set(key, interpolated)
		case map[string]interface{}:
			childSource := simplejson.NewFromAny(value)
			childWriter := simplejson.New()
			writer.Set(key, childWriter.Interface())
			this.EvalObject(childSource, childWriter)
		case []interface{}:
		default:
			log.Info("type: %v", reflect.TypeOf(value))
			log.Error(3, "Unknown json type key: %v , type: %v", key, value)
		}
	}
}
