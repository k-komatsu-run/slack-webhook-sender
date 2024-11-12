'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { sendToSlack } from './actions'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2, Send } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          送信中...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          送信
        </>
      )}
    </Button>
  )
}

export default function SlackWebhookForm() {
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    try {
      setResult(null) // Reset previous result
      const result = await sendToSlack(formData)
      console.log('Server response:', result)
      setResult(result)
      if (result.success) {
        setMessage('')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setResult({ 
        success: false, 
        message: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary">Slack Connect</CardTitle>
        <CardDescription className="text-center">Slackへメッセージを送信</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">メッセージ</Label>
            <Textarea
              id="message"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Slackに送信するメッセージを入力してください"
              required
              className="w-full min-h-[100px]"
            />
          </div>
          <SubmitButton />
        </form>
        {result && (
          <Alert variant={result.success ? "default" : "destructive"} className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{result.success ? '成功' : 'エラー'}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}