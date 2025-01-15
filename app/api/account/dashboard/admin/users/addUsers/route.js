import { auth, database } from "@/lib/firebase";
import { ref, set } from "firebase/database";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

export async function POST(request) {
    try {
        const data = await request.json();
        
        // Generate a temporary password
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

        // Create authentication account
        let userCredential;
        try {
            userCredential = await createUserWithEmailAndPassword(auth, data.email, tempPassword);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                return new Response(
                    JSON.stringify({ error: 'User already exists' }), 
                    { status: 400, headers: { 'Content-Type': 'application/json' }}
                );
            }
            throw error;
        }

        // Send verification email
        await sendEmailVerification(userCredential.user);

        // Add user data to database
        const dbRef = ref(database, "users/" + userCredential.user.uid);
        await set(dbRef, {
            name: data.name,
            email: data.email,
            role: data.role,
            subject: data.subject,
            class: data.class,
            phone: data.phone,
            whatsapp: data.whatsapp,
            about: data.about,
            photoURL: data.photoURL,
            socialLinks: data.socialLinks,
            rollNumber: data.rollNumber,
            dateOfJoining: data.dateOfJoining,
            fatherName: data.fatherName,
            motherName: data.motherName,
            addressPermanent: data.addressPermanent,
            pincodePermanent: data.pincodePermanent,
            addressCurrent: data.sameAsPermament ? data.addressPermanent : data.addressCurrent,
            pincodeCurrent: data.sameAsPermament ? data.pincodePermanent : data.pincodeCurrent,
            session: data.session,
            nationality: data.nationality,
            dateOfBirth: data.dateOfBirth,
            board: data.board,
            aadharNumber: data.aadharNumber,
            bloodGroup: data.bloodGroup,
            category: data.category,
            religion: data.religion,
            gender: data.gender,
            contactPersonal: data.contactPersonal,
            contactParents: data.contactParents,
            schoolName: data.schoolName
        });

        return new Response(
            JSON.stringify({ 
                success: true, 
                uid: userCredential.user.uid,
                message: 'User created successfully'
            }), 
            { 
                status: 201,
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('Error creating user:', error);
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