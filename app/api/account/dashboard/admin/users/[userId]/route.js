import { database } from "@/lib/firebase";
import { ref, update } from "firebase/database";

export async function PUT(request, { params }) {
    try {
        const { userId } = params;
        const data = await request.json();
        
        const dbRef = ref(database, `users/${userId}`);
        await update(dbRef, data);

        return new Response(
            JSON.stringify({ 
                success: true, 
                message: 'User updated successfully'
            }), 
            { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('Error updating user:', error);
        return new Response(
            JSON.stringify({ 
                error: 'Internal Server Error',
                details: error.message 
            }), 
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
