+++
title = "Alert groups"
description = "Alert groups"
keywords = ["grafana", "alerting", "alerts", "groups"]
weight = 445
aliases = ["/docs/grafana/latest/alerting/unified-alerting/alert-groups/"]
+++

# Alert groups

Alert groups show grouped alerts from an Alertmanager instance. By default, the alerts are grouped by the label keys for the root policy in [notification policies]({{< relref "../notifications/_index.md" >}}). Grouping common alerts into a single alert group prevents duplicate alerts from being fired.

For more information, see:

- [View alert groupings]({{< relref "./view-alert-grouping.md" >}})
- [Filter alerts by group]({{< relref "./filter-alerts.md" >}})
