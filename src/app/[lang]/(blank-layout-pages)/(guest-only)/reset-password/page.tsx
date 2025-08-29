// Component Imports
import ResetPasswordV2 from '@views/pages/auth/ResetPasswordV2'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import TwoSteps from '@/views/TwoSteps'

const ResetPasswordV2Page = async () => {
  // Vars
  const mode = await getServerMode()

  return <TwoSteps mode={mode} />
}

export default ResetPasswordV2Page
