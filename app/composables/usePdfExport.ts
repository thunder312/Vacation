import { exportApprovedVacations, exportTeamVacations, exportManagerVacations } from '~/utils/pdf'

export const usePdfExport = () => {
  const { t } = useI18n()
  const toast = useToast()
  const { halfDayRules } = useHalfDayRules()
  const { getBalance } = useVacationBalance()

  const getHalfDayDates = () => (halfDayRules.value || []).map(rule => rule.date)

  const exportMyApprovedVacations = (username: string) => {
    const { getApprovedUserRequests } = useVacationRequests()
    const approvedRequests = getApprovedUserRequests(username).value || []

    const { orgNodes } = useOrganization()
    const user = orgNodes.value?.find(n => n.userId === username)
    const userId = user?.userId || username

    if (!approvedRequests || approvedRequests.length === 0) {
      toast.warning(t('errors.notFound'))
      return
    }

    try {
      const balance = getBalance(userId)
      exportApprovedVacations(username, approvedRequests, balance, getHalfDayDates(), t)
      toast.success(t('vacation.pdfCreated'))
    } catch (error) {
      console.error('Fehler beim PDF-Export:', error)
      toast.error(t('errors.genericError'))
    }
  }

  const exportTeamVacations = (username: string) => {
    const { getAllTeamRequests } = useVacationRequests()
    const teamRequests = getAllTeamRequests(username).value || []

    const { orgNodes } = useOrganization()
    const user = orgNodes.value?.find(n => n.userId === username)
    const teamleadName = user?.displayName || username

    if (!teamRequests || teamRequests.length === 0) {
      toast.warning(t('errors.notFound'))
      return
    }

    try {
      exportTeamVacations(teamleadName, teamRequests, getHalfDayDates(), t)
      toast.success(t('vacation.pdfCreated'))
    } catch (error) {
      console.error('Fehler:', error)
      toast.error(t('errors.genericError'))
    }
  }

  const exportAllVacations = (username: string) => {
    const { getAllRequests } = useVacationRequests()
    const allRequests = getAllRequests().value || []

    const { orgNodes } = useOrganization()
    const user = orgNodes.value?.find(n => n.userId === username)
    const managerName = user?.displayName || username || 'Unbekannt'

    if (!allRequests || allRequests.length === 0) {
      toast.warning(t('errors.notFound'))
      return
    }

    try {
      exportManagerVacations(managerName, allRequests, getHalfDayDates(), t)
      toast.success(t('vacation.pdfCreated'))
    } catch (error) {
      console.error('Fehler:', error)
      toast.error(t('errors.genericError'))
    }
  }

  return {
    exportMyApprovedVacations,
    exportTeamVacations,
    exportAllVacations
  }
}
