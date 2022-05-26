---
aliases:
  - /docs/grafana/latest/enterprise/saml/set-up-saml-with-okta/
description: This is a guide to set up SAML authentication with Okta in Grafana
keywords:
  - grafana
  - saml
  - documentation
  - saml-auth
  - enterprise
menuTitle: SAML authentication with Okta
title: Set up SAML authentication with Okta in Grafana
weight: 30
---

# Set up SAML with Okta

Grafana supports user authentication through Okta, which is useful when you want your users to access Grafana using single sign on. This guide will follow you through the steps of configuring SAML authentication in Grafana with [Okta](https://okta.com/). You need to be an admin in your Okta organization to access Admin Console and create SAML integration. You also need permissions to edit Grafana config file and restart Grafana server.

## Before you begin

- To configure SAML integration with Okta, create integration inside the Okta organization first. [Add integration in Okta](https://help.okta.com/en/prod/Content/Topics/Apps/apps-overview-add-apps.htm)
- Ensure you have permission to administer SAML authentication. For more information about permissions, refer to [About users and permissions]({{< relref "../../administration/manage-users-and-permissions/about-users-and-permissions.md#" >}}).

**To set up SAML with Okta:**

1. Log in to the [Okta portal](https://login.okta.com/).
1. Go to the Admin Console in your Okta organization by clicking **Admin** in the upper-right corner. If you are in the Developer Console, then click **Developer Console** in the upper-left corner and then click **Classic UI** to switch over to the Admin Console.
1. In the Admin Console, navigate to **Applications** > **Applications**.
1. Click **Add Application**.
1. Click **Create New App** to start the Application Integration Wizard.
1. Choose **Web** as a platform.
1. Select **SAML 2.0** in the Sign on method section.
1. Click **Create**.
1. On the **General Settings** tab, enter a name for your Grafana integration. You can also upload a logo.
1. On the **Configure SAML** tab, enter the SAML information related to your Grafana instance:

   - In the **Single sign on URL** field, use the `/saml/acs` endpoint URL of your Grafana instance, for example, `https://grafana.example.com/saml/acs`.
   - In the **Audience URI (SP Entity ID)** field, use the `/saml/metadata` endpoint URL, for example, `https://grafana.example.com/saml/metadata`.
   - Leave the default values for **Name ID format** and **Application username**.
   - In the **ATTRIBUTE STATEMENTS (OPTIONAL)** section, enter the SAML attributes to be shared with Grafana, for example:

     | Attribute name (in Grafana) | Value (in Okta profile)                |
     | --------------------------- | -------------------------------------- |
     | Login                       | `user.login`                           |
     | Email                       | `user.email`                           |
     | DisplayName                 | `user.firstName + " " + user.lastName` |

   - In the **GROUP ATTRIBUTE STATEMENTS (OPTIONAL)** section, enter a group attribute name (for example, `Group`) and set filter to `Matches regex .*` to return all user groups.

1. Click **Next**.
1. On the final Feedback tab, fill out the form and then click **Finish**.

**Edit SAML options for Okta in Grafana config file:**

1. In the `[auth.saml]` section in the Grafana configuration file, set [`enabled`]({{< relref ".././enterprise-configuration.md#enabled" >}}) to `true`.
1. Configure the [certificate and private key]({{< relref "#certificate-and-private-key" >}}).
1. On the Okta application page where you have been redirected after application created, navigate to the **Sign On** tab and find **Identity Provider metadata** link in the **Settings** section.
1. Set the [`idp_metadata_url`]({{< relref ".././enterprise-configuration.md#idp-metadata-url" >}}) to the URL obtained from the previous step. The URL should look like `https://<your-org-id>.okta.com/app/<application-id>/sso/saml/metadata`.
1. Set the following options to the attribute names configured at the **step 10** of the SAML integration setup. You can find this attributes on the **General** tab of the application page (**ATTRIBUTE STATEMENTS** and **GROUP ATTRIBUTE STATEMENTS** in the **SAML Settings** section).
   - [`assertion_attribute_login`]({{< relref ".././enterprise-configuration.md#assertion-attribute-login" >}})
   - [`assertion_attribute_email`]({{< relref ".././enterprise-configuration.md#assertion-attribute-email" >}})
   - [`assertion_attribute_name`]({{< relref ".././enterprise-configuration.md#assertion-attribute-name" >}})
   - [`assertion_attribute_groups`]({{< relref ".././enterprise-configuration.md#assertion-attribute-groups" >}})
1. Save the configuration file and and then restart the Grafana server.

When you are finished, the Grafana configuration might look like this example:

```bash
[server]
root_url = https://grafana.example.com

[auth.saml]
enabled = true
private_key_path = "/path/to/private_key.pem"
certificate_path = "/path/to/certificate.cert"
idp_metadata_url = "https://my-org.okta.com/app/my-application/sso/saml/metadata"
assertion_attribute_name = DisplayName
assertion_attribute_login = Login
assertion_attribute_email = Email
assertion_attribute_groups = Group
```
