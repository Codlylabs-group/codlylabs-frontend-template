import { useEffect } from 'react'

import { buildDocumentTitle } from '../utils/platformBranding'

export function usePageTitle(pageTitle: string, tenantBrandName?: string | null) {
  useEffect(() => {
    document.title = buildDocumentTitle(pageTitle, { tenantBrandName })
  }, [pageTitle, tenantBrandName])
}
