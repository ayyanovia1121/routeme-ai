'use client';
import { SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { User } from "lucide-react"

function HeaderProfileButton() {
  return (
    <>
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Link
        href="/profile" 
        label="Profile"
        labelIcon={<User className="size-4"/>}
        />
      </UserButton.MenuItems>
    </UserButton>

    <SignedOut>
      <SignInButton />
    </SignedOut>
    </>
  )
}

export default HeaderProfileButton