import router from '@/router'
import notificationService from './notificationService'

/**
 * View Dispatcher to handle navigating to the correct resource detail view
 * based on the API path returned by the notification read API.
 */
export const dispatchView = async (path) => {
  if (!path) return
  
  try {
    // 1. Fetch the detail data using the backend path
    const response = await notificationService.executeAction(path)
    const data = response.data || response

    // 2. Parse the path to determine resource type and ID (e.g., "booking/1")
    // Note: Assuming path pattern like "resourceType/resourceId"
    const pathWithoutQuery = path.split('?')[0]
    const parts = pathWithoutQuery.split('/').filter(Boolean)
    const resourceType = parts[0]
    const resourceId = parts[1]

    if (!resourceType || !resourceId) {
      console.warn('Dispatcher could not parse resource type or ID from path:', path)
      return
    }

    // 3. Navigate to the corresponding FE route, passing data via history state
    // so the view doesn't need to fetch it again immediately.
    switch (resourceType.toLowerCase()) {
      case 'booking':
      case 'bookings':
        router.push({
          name: 'BookingDetail',
          params: { id: resourceId },
          state: { detailData: JSON.stringify(data) }
        })
        break
      case 'room':
      case 'rooms':
        router.push({
          name: 'RoomDetails',
          params: { id: resourceId },
          state: { detailData: JSON.stringify(data) }
        })
        break
      default:
        // Generic fallback detail view
        router.push({
          name: 'GenericDetail',
          params: { type: resourceType, id: resourceId },
          state: { detailData: JSON.stringify(data) }
        })
        break
    }
  } catch (err) {
    console.error('View Dispatcher failed to process path:', path, err)
  }
}
