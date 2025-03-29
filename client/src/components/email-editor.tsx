import EditorProvider from '../providers/email-editor/editor-provider'
import EditorNavigation from './editor-component/editor-navigation/editor-navigation'
import EmailEditorSidebar from './editor-component/editor-sidebar'
import EmailEditorGround from './editor-component/root-components'

type Props = {}

const EmailEditor1  = (props: Props) => {
  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-[20] bg-background overflow-hidden">
      <EditorProvider
      >
        <EditorNavigation
        />
        <div className="h-full flex justify-center ">
          <EmailEditorGround
          liveMode={false}
           />
        </div>
        <EmailEditorSidebar />
      </EditorProvider>
    </div>
  )
}

export default EmailEditor1