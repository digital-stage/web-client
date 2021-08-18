import { Router } from '@digitalstage/api-types'

interface Routers {
    byId: {
        [id: string]: Router
    }
    byCountryCode: {
        [countryCode: string]: string[]
    }
    byCity: {
        [city: string]: string[]
    }
    byType: {
        [type: string]: string[]
    }
    allIds: string[]
}

export default Routers
