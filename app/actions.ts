'use server'

import { revalidatePath } from 'next/cache'

export async function sendToSlack(formData: FormData) {
  try {
    const message = formData.get('message')
    if (typeof message !== 'string' || message.trim() === '') {
      throw new Error('Message is required')
    }

    const webhookUrl = process.env.SLACK_WEBHOOK_URL
    if (!webhookUrl) {
      throw new Error('Slack Webhook URL is not configured')
    }

    const payload = {
      text: message,
    }

    console.log('Sending payload to Slack:', JSON.stringify(payload))

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    console.log('Slack API response:', response.status, responseText)

    if (!response.ok) {
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