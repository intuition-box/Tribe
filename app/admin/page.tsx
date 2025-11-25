"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteAllTokens } from "@/lib/tokens"
import { Trash2, ShieldX } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { isAdmin } from "@/lib/admin-config"

export default function AdminPage() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [message, setMessage] = useState("")
  const { address } = useWallet()
  const userIsAdmin = isAdmin(address)

  if (!address) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-600 flex items-center gap-2">
                <ShieldX className="h-5 w-5" />
                Authentication Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Please connect your wallet to access the admin panel.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!userIsAdmin) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <ShieldX className="h-5 w-5" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You do not have permission to access this page. Only authorized administrators can access the admin
                panel.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const handleDeleteAllTokens = async () => {
    if (!confirm("⚠️ WARNING: This will permanently delete ALL tokens from the database. Are you sure?")) {
      return
    }

    if (!confirm("This action CANNOT be undone. Type DELETE in the next prompt to continue.")) {
      return
    }

    const confirmation = prompt("Type DELETE to confirm:")
    if (confirmation !== "DELETE") {
      setMessage("Deletion cancelled")
      return
    }

    setIsDeleting(true)
    setMessage("Deleting all tokens...")

    try {
      const success = await deleteAllTokens()
      if (success) {
        setMessage("✅ All tokens have been deleted successfully. Redirecting to homepage...")
        // Clear localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("walletConnected")
        }
        // Reload page after 1 second with cache bypass
        setTimeout(() => {
          window.location.href = "/?t=" + Date.now()
        }, 1000)
      } else {
        setMessage("❌ Failed to delete tokens. Check console for errors.")
      }
    } catch (error) {
      console.error("Error deleting tokens:", error)
      setMessage("❌ Error occurred while deleting tokens")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions that affect the entire platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold mb-2">Delete All Tokens</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This will permanently delete all meme tokens from the database. This action cannot be undone. Use this
                before deploying a new contract.
              </p>
              <Button variant="destructive" onClick={handleDeleteAllTokens} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete All Tokens"}
              </Button>
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg ${message.includes("✅") ? "bg-green-50 text-green-800" : message.includes("❌") ? "bg-red-50 text-red-800" : "bg-blue-50 text-blue-800"}`}
              >
                {message}
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold mb-2">Next Steps After Deletion</h3>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Update the contract address in lib/contract-config.ts</li>
                <li>Replace the ABI in lib/contract-abi.json with your new contract's ABI</li>
                <li>Test token creation with the new contract</li>
                <li>Verify all trading functions work correctly</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
