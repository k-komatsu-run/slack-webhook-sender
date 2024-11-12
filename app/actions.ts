'use server'

import { revalidatePath } from 'next/cache'

export async function sendToSlack(formData: FormData) {
  const message = formData.get('message') as string
  const file = formData.get('file') as File | null

  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    throw new Error('Slack Webhook URL is not configured')
  }

  let fileUrl = ''
  if (file && file.size > 0) {
    // ここで実際のファイルアップロード処理を行います
    // この例ではプレースホルダーURLを使用しています
    fileUrl = `https://example.com/uploaded-file-${file.name}`
    console.log(`File would be uploaded: ${file.name}`)
  }

  const payload = {
    text: message,
    attachments: fileUrl ? [{ image_url: fileUrl }] : [],
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error('Failed to send message to Slack')
    }

    revalidatePath('/')
    return { success: true, message: 'Message sent to Slack successfully!' }
  } catch (error) {
    console.error('Error sending message to Slack:', error)
    return { success: false, message: 'Failed to send message to Slack' }
  }
}