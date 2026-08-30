import ConfigForm, {
  ConfigForm as NamedConfigForm,
  createConfigForm,
  defineConfigFormType,
  defineConfigFormTypes,
  defineConfigFormItems,
  type ConfigFormExpose,
  type FormItemConfig
} from '@itagan/config-form'
import '@itagan/config-form/style.css'

const items: FormItemConfig[] = defineConfigFormItems([{ fieldKey: 'name', type: 'input' }])
const field = defineConfigFormType<{ name: string }>()({ is: 'custom-field' })
const fieldTypes = defineConfigFormTypes<{ name: string }>()({ custom: field })
const component = createConfigForm<{ name: string }>()
const customComponent = createConfigForm<{ name: string }, typeof fieldTypes>()
declare const formRef: ConfigFormExpose

void ConfigForm
void NamedConfigForm
void component
void customComponent
void items
void fieldTypes
void formRef.validate()
