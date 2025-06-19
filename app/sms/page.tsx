"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  MessageSquare,
  Plus,
  Send,
  Clock,
  Users,
  User,
  Smartphone,
  CreditCard,
  Edit,
  Trash2,
  Copy,
  RefreshCw,
} from "lucide-react"

// Dummy data for SMS history
const smsHistoryData = [
  {
    id: 1,
    recipient: "John Smith (+254712345678)",
    message: "Your rent payment of KES 25,000 is due on 15th January. Please pay on time.",
    status: "Delivered",
    dateSent: "2024-01-10 14:30",
    cost: 1,
  },
  {
    id: 2,
    recipient: "Group: All Tenants (15 recipients)",
    message: "Water maintenance scheduled for tomorrow 9AM-12PM. Please store water in advance.",
    status: "Delivered",
    dateSent: "2024-01-09 16:45",
    cost: 15,
  },
  {
    id: 3,
    recipient: "Sarah Johnson (+254723456789)",
    message: "Reminder: Your rent payment is overdue. Please contact management.",
    status: "Failed",
    dateSent: "2024-01-08 10:15",
    cost: 0,
  },
]

// Dummy data for SMS templates
const smsTemplatesData = [
  {
    id: 1,
    name: "Rent Due Reminder",
    content:
      "Dear {tenant_name}, your rent payment of KES {amount} is due on {due_date}. Please pay on time to avoid late fees.",
    variables: ["tenant_name", "amount", "due_date"],
    category: "Payment",
  },
  {
    id: 2,
    name: "Maintenance Notice",
    content:
      "Dear {tenant_name}, maintenance work is scheduled for {date} from {start_time} to {end_time}. Please plan accordingly.",
    variables: ["tenant_name", "date", "start_time", "end_time"],
    category: "Maintenance",
  },
  {
    id: 3,
    name: "Welcome Message",
    content:
      "Welcome to {property_name}, {tenant_name}! Your unit {unit_number} is ready. Contact us at {contact_number} for any assistance.",
    variables: ["property_name", "tenant_name", "unit_number", "contact_number"],
    category: "Welcome",
  },
]

export default function SMSPage() {
  const [smsBalance] = useState(250) // Dummy balance
  const [recipientType, setRecipientType] = useState("individual")
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([])
  const [currentPhone, setCurrentPhone] = useState("")
  const [message, setMessage] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [isRechargeOpen, setIsRechargeOpen] = useState(false)
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [mpesaPhone, setMpesaPhone] = useState("")

  const [templateForm, setTemplateForm] = useState({
    name: "",
    content: "",
    category: "",
  })

  const rechargePackages = [
    { amount: 100, sms: 50, value: "100-50" },
    { amount: 200, sms: 110, value: "200-110" },
    { amount: 500, sms: 300, value: "500-300" },
    { amount: 1000, sms: 650, value: "1000-650" },
    { amount: 2000, sms: 1400, value: "2000-1400" },
  ]

  const addPhoneNumber = () => {
    if (currentPhone && !phoneNumbers.includes(currentPhone)) {
      setPhoneNumbers([...phoneNumbers, currentPhone])
      setCurrentPhone("")
    }
  }

  const removePhoneNumber = (phone: string) => {
    setPhoneNumbers(phoneNumbers.filter((p) => p !== phone))
  }

  const insertTemplate = (templateContent: string) => {
    setMessage(templateContent)
  }

  const handleSendSMS = () => {
    console.log("Sending SMS:", {
      recipientType,
      recipients: recipientType === "individual" ? phoneNumbers : "group",
      message,
      scheduled: false,
    })
    // Reset form
    setMessage("")
    setPhoneNumbers([])
  }

  const handleCreateTemplate = () => {
    console.log("Creating template:", templateForm)
    setIsCreateTemplateOpen(false)
    setTemplateForm({ name: "", content: "", category: "" })
  }

  const handleRecharge = () => {
    console.log("Processing recharge:", {
      package: selectedPackage,
      customAmount,
      mpesaPhone,
    })
    setIsRechargeOpen(false)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SMS Communications</h1>
            <p className="text-gray-600">Send messages to tenants and manage SMS templates</p>
          </div>

          {/* SMS Balance Card */}
          <Card className="w-64">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">SMS Balance</p>
                  <p className="text-2xl font-bold text-blue-600">{smsBalance}</p>
                  <p className="text-xs text-gray-500">messages remaining</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <Dialog open={isRechargeOpen} onOpenChange={setIsRechargeOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full mt-3 bg-green-600 hover:bg-green-700" size="sm">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Recharge via M-Pesa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Recharge SMS Balance</DialogTitle>
                    <DialogDescription>Choose a package or enter custom amount</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Package Options */}
                    <div className="space-y-3">
                      <Label>Select Package</Label>
                      <RadioGroup value={selectedPackage} onValueChange={setSelectedPackage}>
                        {rechargePackages.map((pkg) => (
                          <div key={pkg.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={pkg.value} id={pkg.value} />
                            <Label htmlFor={pkg.value} className="flex-1 cursor-pointer">
                              <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                                <span>KSh {pkg.amount}</span>
                                <span className="text-blue-600 font-medium">{pkg.sms} SMS</span>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Custom Amount */}
                    <div className="space-y-2">
                      <Label htmlFor="customAmount">Custom Amount (KSh)</Label>
                      <Input
                        id="customAmount"
                        type="number"
                        placeholder="Enter custom amount"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                      />
                    </div>

                    {/* M-Pesa Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="mpesaPhone">M-Pesa Phone Number</Label>
                      <Input
                        id="mpesaPhone"
                        placeholder="e.g., 254712345678"
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                      />
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <Button onClick={handleRecharge} className="flex-1 bg-green-600 hover:bg-green-700">
                        Initiate Payment
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => setIsRechargeOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="compose" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Compose Tab */}
          <TabsContent value="compose" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compose SMS</CardTitle>
                <CardDescription>Send SMS to individual tenants or groups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Recipient Type */}
                <div className="space-y-3">
                  <Label>Recipient Type</Label>
                  <RadioGroup value={recipientType} onValueChange={setRecipientType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="individual" id="individual" />
                      <Label htmlFor="individual" className="flex items-center cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Individual
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="group" id="group" />
                      <Label htmlFor="group" className="flex items-center cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        Group
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Phone Number Input (Individual) */}
                {recipientType === "individual" && (
                  <div className="space-y-3">
                    <Label>Phone Numbers</Label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter phone number (e.g., 254712345678)"
                        value={currentPhone}
                        onChange={(e) => setCurrentPhone(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={addPhoneNumber} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Phone Numbers List */}
                    {phoneNumbers.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Recipients ({phoneNumbers.length})</Label>
                        <div className="flex flex-wrap gap-2">
                          {phoneNumbers.map((phone, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              <Smartphone className="h-3 w-3" />
                              {phone}
                              <button
                                onClick={() => removePhoneNumber(phone)}
                                className="ml-1 text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Group Selection */}
                {recipientType === "group" && (
                  <div className="space-y-2">
                    <Label>Select Group</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose recipient group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-tenants">All Tenants (82 recipients)</SelectItem>
                        <SelectItem value="current-tenants">Current Tenants (67 recipients)</SelectItem>
                        <SelectItem value="arrears-tenants">Tenants with Arrears (8 recipients)</SelectItem>
                        <SelectItem value="block-a">Block A Tenants (25 recipients)</SelectItem>
                        <SelectItem value="block-b">Block B Tenants (30 recipients)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Message Textarea */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Message</Label>
                    <span className="text-sm text-gray-500">{message.length}/160</span>
                  </div>
                  <Textarea
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-32"
                    maxLength={160}
                  />
                </div>

                {/* Template and Schedule Options */}
                <div className="flex flex-wrap gap-4">
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Insert Template" />
                    </SelectTrigger>
                    <SelectContent>
                      {smsTemplatesData.map((template) => (
                        <SelectItem key={template.id} value={template.content}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedTemplate && (
                    <Button variant="outline" onClick={() => insertTemplate(selectedTemplate)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Insert
                    </Button>
                  )}

                  <Button variant="outline">
                    <Clock className="mr-2 h-4 w-4" />
                    Schedule SMS
                  </Button>
                </div>

                {/* Send Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleSendSMS}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!message || (recipientType === "individual" && phoneNumbers.length === 0)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send SMS
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>SMS Templates</CardTitle>
                    <CardDescription>Manage reusable SMS templates with variables</CardDescription>
                  </div>
                  <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create SMS Template</DialogTitle>
                        <DialogDescription>Create a reusable SMS template with variables</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="templateName">Template Name</Label>
                          <Input
                            id="templateName"
                            placeholder="e.g., Rent Due Reminder"
                            value={templateForm.name}
                            onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="templateCategory">Category</Label>
                          <Select
                            value={templateForm.category}
                            onValueChange={(value) => setTemplateForm({ ...templateForm, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="payment">Payment</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="welcome">Welcome</SelectItem>
                              <SelectItem value="notice">Notice</SelectItem>
                              <SelectItem value="reminder">Reminder</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="templateContent">Template Content</Label>
                          <Textarea
                            id="templateContent"
                            placeholder="Use {variable_name} for dynamic content..."
                            value={templateForm.content}
                            onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                            className="min-h-24"
                          />
                          <p className="text-xs text-gray-500">
                            Use variables like {"{tenant_name}"}, {"{amount}"}, {"{due_date}"} for dynamic content
                          </p>
                        </div>

                        <div className="flex space-x-2 pt-4">
                          <Button onClick={handleCreateTemplate} className="flex-1 bg-blue-600 hover:bg-blue-700">
                            Create Template
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => setIsCreateTemplateOpen(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {smsTemplatesData.map((template) => (
                    <Card key={template.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{template.name}</h3>
                            <Badge variant="outline">{template.category}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{template.content}</p>
                          <div className="flex flex-wrap gap-1">
                            {template.variables.map((variable) => (
                              <Badge key={variable} variant="secondary" className="text-xs">
                                {"{" + variable + "}"}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SMS History</CardTitle>
                <CardDescription>View all sent SMS messages and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date Sent</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {smsHistoryData.map((sms) => (
                        <TableRow key={sms.id}>
                          <TableCell className="font-medium">{sms.recipient}</TableCell>
                          <TableCell className="max-w-xs truncate">{sms.message}</TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                sms.status === "Delivered"
                                  ? "bg-green-100 text-green-800"
                                  : sms.status === "Failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {sms.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{sms.dateSent}</TableCell>
                          <TableCell>{sms.cost} SMS</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
