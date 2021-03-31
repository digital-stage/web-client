import * as Yup from "yup";
import {Field, Form, Formik, FormikProps} from "formik";
import React, {useCallback} from "react";
import {useIntl} from "react-intl";
import {ClientDeviceEvents, Stage, useConnection} from "@digitalStage/api-client-react";
import Modal from "../ui/surface/Modal";
import Input from "../ui/form/Input";
import SecondaryButton from "../ui/button/SecondaryButton";
import PrimaryButton from "../ui/button/PrimaryButton";

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
      open={open}
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
            <h3>Hello world</h3>
            <div>
              <p>
                Proin ut dui sed metus pharetra hend rerit vel non
                mi. Nulla ornare faucibus ex, non facilisis nisl.
                Maecenas aliquet mauris ut tempus.
              </p>
              <Form className="form" autoComplete="on">
                  <Field
                    as={Input}
                    label={f('stageName')}
                    placeholder={f('stageName')}
                    type="name"
                    name="name"
                    autoComplete="name"
                    valid={!!props.errors.name}
                    notification={props.errors.name}
                    error={props.touched.name && props.errors.name}
                    maxLength={100}
                  />
                  <Field
                    as={Input}
                    label={f('stageDescription')}
                    placeholder={f('stageDescription')}
                    type="description"
                    name="description"
                    valid={!!props.errors.description}
                    error={props.touched.description && props.errors.description}
                    notification={props.errors.description || f('stageDescriptionCaption')}
                    maxLength={100}
                  />
                  <Field
                    as={Input}
                    label={f('stagePassword')}
                    placeholder={f('stagePassword')}
                    type="password"
                    name="password"
                    valid={!!props.errors.password}
                    error={props.errors.password || f('stagePasswordCaption')}
                    maxLength={20}
                  />
                  <Field
                    as={Input}
                    label={f('stageWidth')}
                    placeholder={f('stageWidth')}
                    type="number"
                    name="width"
                    valid={!!props.errors.width}
                    notification={f('stagePasswordCaption')}
                    error={props.touched.width && props.errors.width}
                    min={1}
                  />
                  <Field
                    as={Input}
                    label={f('stageLength')}
                    placeholder={f('stageLength')}
                    type="number"
                    name="length"
                    valid={!!props.errors.length}
                    error={props.touched.length && props.errors.length}
                    min={1}
                  />
                  <Field
                    as={Input}
                    label={f('stageHeight')}
                    placeholder={f('stageHeight')}
                    type="number"
                    name="height"
                    valid={!!props.errors.height}
                    error={props.touched.height && props.errors.height}
                    min={1}
                  />
                  <Field
                    as={Input}
                    label={f('stageAbsorption')}
                    placeholder={f('stageAbsorption')}
                    type="number"
                    name="absorption"
                    valid={!!props.errors.absorption}
                    error={props.touched.absorption && props.errors.absorption}
                    step={0.1}
                    min={0}
                    max={1}
                  />
                  <Field
                    as={Input}
                    label={f('stageReflection')}
                    placeholder={f('stageReflection')}
                    type="number"
                    name="reflection"
                    valid={!!props.errors.reflection}
                    error={props.touched.reflection && props.errors.reflection}
                    step={0.1}
                    min={0}
                    max={1}
                  />
              </Form>
            </div>
            <div>
              <SecondaryButton onClick={onClose}>
                {f('cancel')}
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={!props.isValid} onClick={props.submitForm}>{f('create')}</PrimaryButton>
            </div>
          </>
        )}
      </Formik>
      <style jsx>{
        `.form {
          display: flex;
          flex-direction: column;
          align-items: center;
        }`}</style>
    </Modal>
  );
}
export default CreateStageModal;