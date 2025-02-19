'use client';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { User } from "lucide-react"

function HeaderProfileButton() {
  return (
    <>
      <SignedIn>
        <UserButton>
          <UserButton.MenuItems>
            <UserButton.Link
              href="/profile"
              label="Profile"
              labelIcon={<User className="size-4" />}
            />
          </UserButton.MenuItems>
        </UserButton>
      </SignedIn>

      <SignedOut>
        <SignInButton />
      </SignedOut>
    </>
  );
}

export default HeaderProfileButton