"use client";

import { PrivyProvider } from "@privy-io/react-auth";

function PrivyProviderB({ children }: { children: React.ReactNode }) {
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
    if (!appId) {
        throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not set");
    }

    return (
        <PrivyProvider
            appId={appId}
            config={{
                loginMethods: ["passkey", "wallet", "apple", "google"],
                appearance: {
                    theme: "dark",
                },
                embeddedWallets: {
                    createOnLogin: "all-users",
                },
            }}
        >
            {children}
        </PrivyProvider>
    );
}

export default PrivyProviderB;

