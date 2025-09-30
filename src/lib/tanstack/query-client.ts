import { QueryClient } from '@tanstack/react-query'
import { queryClientConfig } from './query-config'

export const queryClient = new QueryClient(queryClientConfig)