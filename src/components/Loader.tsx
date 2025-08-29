import React from 'react'

const Loader = () => {

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999] pointer-events-auto">
      <div
        className="w-16 h-16 border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin"
        aria-label="Loading"
      />
    </div>
  )
}

export default Loader
