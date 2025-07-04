"use client"
import React from 'react';
import ImportExport from '@/components/ImportExport';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const Page = () => {
   const router = useRouter();
   const { data: session, status } = useSession({
      required: true,
      onUnauthenticated() {
        router.push('/');
      },
    });
  return (
    <>
     <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6"> Backup & Restore</h1>
        {session?.user?.id && <ImportExport userId={session.user.id} />}
      </div>
    </div>
    </>
  )
}

export default Page