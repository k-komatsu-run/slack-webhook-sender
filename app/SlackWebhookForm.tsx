'use client'

import { useState, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { sendToSlack } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2, Send, Paperclip } from "lucide-react"
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
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(formData: FormData) {
    const result = await sendToSlack(formData)
    setResult(result)
    if (result.success) {
      setMessage('')
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary">Slack Connect</CardTitle>
        <CardDescription className="text-center">スタイリッシュにSlackへメッセージを送信</CardDescription>
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
          <div className="space-y-2">
            <Label htmlFor="file">添付ファイル</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="file"
                name="file"
                type="file"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                選択されたファイル: {file.name}
              </p>
            )}
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