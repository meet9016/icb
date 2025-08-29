// Next Imports
import type { Metadata } from 'next'

// Component Imports
import ForgotPassword from '@views/ForgotPassword'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import ForgotUsername from '@/views/ForgotUsername'

// export const metadata: Metadata = {
//   title: 'Forgot Password',
//   description: 'Forgotten Password to your account'
// }

const ForgotPasswordPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <ForgotUsername mode={mode} />
}

export default ForgotPasswordPage
