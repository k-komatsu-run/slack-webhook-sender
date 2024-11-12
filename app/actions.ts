'use server'

import { revalidatePath } from 'next/cache'

export async function sendToSlack(formData: FormData) {
  try {
    const message = formData.get('message') as string
    const file = formData.get('file') as File | null

    const webhookUrl = process.env.SLACK_WEBHOOK_URL

    if (!webhookUrl) {
      throw new Error('Slack Webhook URL is not configured')
    }

    let fileUrl = ''
    if (file && file.size > 0) {
      console.log(`File would be uploaded: ${file.name}`)
      fileUrl = `https://example.com/uploaded-file-${file.name}`
    }

    const payload = {
      text: message,
      attachments: fileUrl ? [{ image_url: fileUrl }] : [],
    }

    console.log('Sending payload to Slack:', JSON.stringify(payload))

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const responseText = await response.text()
      throw new Error(`Failed to send message to Slack: ${response.status} ${response.statusText}\n${responseText}`)
    }

    console.log('Message sent successfully')
    revalidatePath('/')
    return { success: true, message: 'Message sent to Slack successfully!' }
  } catch (error) {
    console.error('Error in sendToSlack:', error)
    return { 
      success: false, 
      message: `Failed to send message to Slack: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}