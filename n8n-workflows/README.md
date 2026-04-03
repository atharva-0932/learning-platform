# n8n Workflows for SkillsSphere

## Job Follow-Up Workflow

This workflow receives a webhook from the SkillsSphere app when you click "Follow Up" on a job card, drafts a personalized follow-up email, and optionally sends it.

### Import Instructions

1. Open your **n8n Cloud** instance.
2. Go to **Workflows** → **Add workflow** → **Import from file** (or paste JSON).
3. Select `job-follow-up-workflow.json` from `n8n-workflows/`.

### Configure the Webhook

1. Open the **Webhook** node.
2. Ensure **Path** is `job-follow-up`.
3. Copy your **Production Webhook URL** (e.g. `https://your-instance.app.n8n.cloud/webhook/job-follow-up`).
4. Add it to your app's `.env.local`:
   ```
   N8N_FOLLOW_UP_WEBHOOK_URL=https://your-instance.app.n8n.cloud/webhook/job-follow-up
   ```

### Optional: Send Email via Gmail

To actually send the email (not just draft it):

1. Add a **Gmail** node between "Draft Email Content" and "Respond to Webhook".
2. Set **Operation** to **Send Email**.
3. Configure credentials (Gmail OAuth2).
4. Map fields:
   - **To:** `{{ $json.to }}`
   - **Subject:** `{{ $json.subject }}`
   - **Message:** `{{ $json.body }}`
5. Connect: Draft Email Content → Gmail → Respond to Webhook.

### Webhook Payload

The app sends:

```json
{
  "jobId": "uuid",
  "recruiterEmail": "recruiter@company.com",
  "companyName": "Acme Inc",
  "jobTitle": "Software Engineer",
  "userId": "user-uuid"
}
```

### Activate

Enable the workflow (toggle in the top right) so the webhook accepts requests.
