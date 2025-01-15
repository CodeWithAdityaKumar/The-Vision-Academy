import { database } from "@/lib/firebase";
import { ref, get, set, remove } from "firebase/database";

export async function POST(request) {
    try {
        const { action, userId, userData } = await request.json();

        if (!userId || !action) {
            return new Response(
                JSON.stringify({ error: "userId and action are required" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        const userRef = ref(database, `users/${userId}`);

        switch (action) {
            case 'delete':
                await remove(userRef);
                return new Response(
                    JSON.stringify({ message: "User deleted successfully" }),
                    { headers: { "Content-Type": "application/json" } }
                );

            case 'updateRole':
                if (!userData || !userData.role) {
                    return new Response(
                        JSON.stringify({ error: "Role is required for update" }),
                        {
                            status: 400,
                            headers: { "Content-Type": "application/json" },
                        }
                    );
                }

                const snapshot = await get(userRef);
                if (!snapshot.exists()) {
                    return new Response(
                        JSON.stringify({ error: "User not found" }),
                        {
                            status: 404,
                            headers: { "Content-Type": "application/json" },
                        }
                    );
                }

                const currentData = snapshot.val();
                await set(userRef, {
                    ...currentData,
                    role: userData.role
                });

                return new Response(
                    JSON.stringify({ message: "Role updated successfully" }),
                    { headers: { "Content-Type": "application/json" } }
                );

            default:
                return new Response(
                    JSON.stringify({ error: "Invalid action" }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    }
                );
        }

    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({
                error: "Internal Server Error",
                details: error.message,
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}