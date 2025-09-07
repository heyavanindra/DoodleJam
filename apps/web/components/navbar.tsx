import React from 'react'
import Link from 'next/link'

const Navbar = () => {
  return (
    <div className='fixed top-0 left-0 right-0 z-10 bg-transparent dark:text-neutral-300 flex justify-between items-center'>
        <div className='py-4 px-6 text-2xl font-bold'>
            DoodleJam
        </div>
        <div>
            <Link href={"/login"} className='mx-6 py-2 px-6 bg-neutral-800 rounded-xl cursor-pointer' >Login</Link>
        </div>
    </div>
  )
}

export default Navbar