import {Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE, SIZE} from "baseui/modal";
import {Button, KIND as ButtonKind} from "baseui/button";
import * as Yup from "yup";
import {Field, Form, Formik, FormikProps} from "formik";
import React, {useCallback} from "react";
import {Input} from "baseui/input";
import {styled} from "baseui";
import {useIntl} from "react-intl";
import {FormControl} from "baseui/form-control";
import {ClientDeviceEvents, Stage, useConnection} from "@digitalStage/api-client-react";

const StyledForm = styled(Form, {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
});

const CreateStageModal = (props: { open: boolean, onClose: () => void }) => {
  const {open, onClose} = props;
  const {formatMessage} = useIntl();
  const f = id => formatMessage({id});
  const connection = useConnection();
  const handleSubmit = useCallback((values, actions) => {
    if (connection) {
      const payload: Omit<Stage, "_id"> = {
        name: values.name,
        description: values.description,
        password: values.password,
        width: values.width,
        length: values.length,
        height: values.height,
        absorption: values.absorption,
        reflection: values.reflection
      };
      connection.emit(ClientDeviceEvents.CreateStage, payload);
    }
  }, [connection]);
  return (
    <Modal
      onClose={onClose}
      closeable
      isOpen={open}
      animate
      autoFocus
      size={SIZE.auto}
      role={ROLE.dialog}
    >
      <Formik
        initialValues={{
          name: '',
          description: '',
          password: '',
          width: 25,
          height: 20,
          length: 10,
          absorption: 0,
          reflection: 0
        }}
        onSubmit={handleSubmit}
        validationSchema={Yup.object().shape({
          name: Yup.string()
            .min(4, f('stageNameMinLength'))
            .required(f('stageNameRequired')),
          description: Yup.string(),
          password: Yup.string()
            .min(2, f('stagePasswordMinLength')),
          width: Yup.number()
            .min(0),
          height: Yup.number()
            .min(0),
          length: Yup.number()
            .min(0),
          absorption: Yup.number()
            .min(0)
            .max(1),
          reflection: Yup.number()
            .min(0)
            .max(1),
        })}
      >
        {(props: FormikProps<any>) => (
          <>
            <ModalHeader>Hello world</ModalHeader>
            <ModalBody>
              Proin ut dui sed metus pharetra hend rerit vel non
              mi. Nulla ornare faucibus ex, non facilisis nisl.
              Maecenas aliquet mauris ut tempus.
              <StyledForm autoComplete="on">
                <FormControl
                  label={() => f('stageName')}
                  caption={() => f('stageNameCaption')}
                  error={props.errors.name}
                >
                  <Field
                    as={Input}
                    label={f('stageName')}
                    placeholder={f('stageName')}
                    type="name"
                    name="name"
                    autoComplete="name"
                    valid={!!props.errors.name}
                    notification={props.errors.name}
                    maxLength={100}
                  />
                </FormControl>
                <FormControl
                  label={() => f('stageDescription')}
                  caption={() => f('stageDescriptionCaption')}
                  error={props.errors.description}
                >
                  <Field
                    as={Input}
                    label={f('stageDescription')}
                    placeholder={f('stageDescription')}
                    type="description"
                    name="description"
                    valid={!!props.errors.description}
                    notification={props.errors.description}
                    maxLength={100}
                  />
                </FormControl>
                <FormControl
                  label={() => f('stagePassword')}
                  caption={() => f('stagePasswordCaption')}
                  error={props.errors.password}
                >
                  <Field
                    as={Input}
                    label={f('stagePassword')}
                    placeholder={f('stagePassword')}
                    type="password"
                    name="password"
                    valid={!!props.errors.password}
                    notification={props.errors.password}
                    maxLength={20}
                  />
                </FormControl>
                <FormControl
                  label={() => f('stageWidth')}
                  caption={() => f('stageWidthCaption')}
                  error={props.errors.width}
                >
                  <Field
                    as={Input}
                    label={f('stageWidth')}
                    placeholder={f('stageWidth')}
                    type="number"
                    name="width"
                    valid={!!props.errors.width}
                    notification={props.errors.width}
                    min={1}
                  />
                </FormControl>
                <FormControl
                  label={() => f('stageLength')}
                  caption={() => f('stageLengthCaption')}
                  error={props.errors.length}
                >
                  <Field
                    as={Input}
                    label={f('stageLength')}
                    placeholder={f('stageLength')}
                    type="number"
                    name="length"
                    valid={!!props.errors.length}
                    notification={props.errors.length}
                    min={1}
                  />
                </FormControl>
                <FormControl
                  label={() => f('stageHeight')}
                  caption={() => f('stageHeightCaption')}
                  error={props.errors.height}
                >
                  <Field
                    as={Input}
                    label={f('stageHeight')}
                    placeholder={f('stageHeight')}
                    type="number"
                    name="height"
                    valid={!!props.errors.height}
                    notification={props.errors.height}
                    min={1}
                  />
                </FormControl>
                <FormControl
                  label={() => f('stageAbsorption')}
                  caption={() => f('stageAbsorptionCaption')}
                  error={props.errors.absorption}
                >
                  <Field
                    as={Input}
                    label={f('stageAbsorption')}
                    placeholder={f('stageAbsorption')}
                    type="number"
                    name="absorption"
                    valid={!!props.errors.absorption}
                    notification={props.errors.absorption}
                    step={0.1}
                    min={0}
                    max={1}
                  />
                </FormControl>
                <FormControl
                  label={() => f('stageReflection')}
                  caption={() => f('stageReflectionCaption')}
                  error={props.errors.reflection}
                >
                  <Field
                    as={Input}
                    label={f('stageReflection')}
                    placeholder={f('stageReflection')}
                    type="number"
                    name="reflection"
                    valid={!!props.errors.reflection}
                    notification={props.errors.reflection}
                    step={0.1}
                    min={0}
                    max={1}
                  />
                </FormControl>
              </StyledForm>
            </ModalBody>
            <ModalFooter>
              <ModalButton onClick={onClose} kind={ButtonKind.tertiary}>
                {f('cancel')}
              </ModalButton>
              <Button type="submit" disabled={!props.isValid} onClick={props.submitForm}>{f('create')}</Button>
            </ModalFooter>
          </>
        )}
      </Formik>
    </Modal>
  );
}
export default CreateStageModal;