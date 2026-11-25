import { importPKCS8, SignJWT } from "jose"

type DocumentAccess = {
  userId: string
  action: "Documents:Read" | "Documents:Write"
}

// Use the signed-in user's ID and permission for this exact document.
const authorizeDocument: (
  request: Request,
  documentName: string
) => Promise<DocumentAccess | null> = async () => null

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const documentName = body?.documentName
  if (
    typeof documentName !== "string" ||
    !documentName.trim() ||
    documentName !== documentName.trim() ||
    documentName === "*"
  ) {
    return Response.json(
      { error: "Expected a document name." },
      { status: 400 }
    )
  }

  const environmentId =
    process.env.TIPTAP_ENVIRONMENT_ID || process.env.TIPTAP_AUTH_ENVIRONMENT_ID
  const privateKey = (
    process.env.TIPTAP_PRIVATE_KEY || process.env.TIPTAP_AUTH_PRIVATE_KEY
  )?.replace(/\\n/g, "\n")
  if (!environmentId || !privateKey) {
    return Response.json(
      { error: "Configure Tiptap Access Control on the server." },
      { status: 503 }
    )
  }

  const access = await authorizeDocument(request, documentName)
  if (!access) {
    return Response.json({ error: "Document access denied." }, { status: 403 })
  }

  try {
    const key = await importPKCS8(privateKey, "ES256")
    const token = await new SignJWT({
      permissions: [{ action: access.action, resource: documentName }],
    })
      .setProtectedHeader({ alg: "ES256" })
      .setIssuer(environmentId)
      .setAudience(["Documents"])
      .setSubject(access.userId)
      .setIssuedAt()
      .setExpirationTime("30m")
      .sign(key)
    return Response.json(
      { token },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch {
    return Response.json(
      { error: "Check the Tiptap signing key on the server." },
      { status: 503 }
    )
  }
}
