import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { Trans } from '@lingui/react/macro'

function App() {
  return (
    <I18nProvider i18n={i18n}>
      <div>
        <h1>
          <Trans>hi</Trans>
        </h1>
      </div>
    </I18nProvider>
  )
}

export default App
