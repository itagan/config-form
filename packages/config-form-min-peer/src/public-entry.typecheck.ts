import ConfigForm, {
  ConfigForm as NamedConfigForm,
  createConfigForm,
  defineConfigFormType,
  defineConfigFormTypes,
  defineFormItems,
  type ConfigFormRef,
  type FormItemConfig
} from '@itagan/config-form'
import '@itagan/config-form/style.css'

const items: FormItemConfig[] = defineFormItems([{ fieldKey: 'name', type: 'input' }])
const field = defineConfigFormType()({ is: 'custom-field' })
const fieldTypes = defineConfigFormTypes()({ custom: field })
const component = createConfigForm<{ name: string }>()
declare const formRef: ConfigFormRef

void ConfigForm
void NamedConfigForm
void component
void items
void fieldTypes
void formRef.validate()
