import * as Yup from "yup";
import {Field, Form, Formik, FormikProps} from "formik";
import React, {useCallback} from "react";
import {useIntl} from "react-intl";
import {ClientDeviceEvents, Group, Stage, useConnection} from "@digitalstage/api-client-react";
import Modal from "../ui/surface/Modal";
import Input from "../ui/form/Input";
import SecondaryButton from "../ui/button/SecondaryButton";
import PrimaryButton from "../ui/button/PrimaryButton";
import Row from "../ui/surface/Row";

const ModifyGroupModal = (props: { open: boolean, onClose: () => void, stage?: Stage, group?: Group }) => {
  const {open, onClose, group, stage} = props;
  const {formatMessage} = useIntl();
  const f = id => formatMessage({id});
  const connection = useConnection();
  const handleSubmit = useCallback((values, actions) => {
    if (connection) {
      if (group) {
        const payload: Partial<Group> = {
          _id: group._id,
          stageId: stage._id,
          name: values.name,
          description: values.description,
        };
        connection.emit(ClientDeviceEvents.ChangeGroup, payload);
      } else {
        const payload: Partial<Omit<Group, "_id">> = {
          stageId: stage._id,
          name: values.name,
          description: values.description
        };
        connection.emit(ClientDeviceEvents.CreateGroup, payload);
      }
      onClose();
    }
  }, [connection, stage, group, onClose]);
  return (
    <Modal
      onClose={onClose}
      open={open}
    >
      <Formik
        initialValues={{
          name: group && group.name || '',
          description: group && group.description || '',
        }}
        onSubmit={handleSubmit}
        validationSchema={Yup.object().shape({
          name: Yup.string()
            .min(4, f('nameTooShort'))
            .max(255, f('nameTooLong'))
            .required(f('nameRequired')),
          description: Yup.string()
        })}
      >
        {(props: FormikProps<any>) => (
          <>
            <h3>{group ? f('modifyGroup') : f('createGroup')}</h3>
            <p>
              {group ? f('modifyGroupDescription') : f('createGroupDescription')}
            </p>
            <Form className="form" autoComplete="on">
              <Field
                as={Input}
                label={f('name')}
                placeholder={f('name')}
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
                label={f('description')}
                placeholder={f('description')}
                type="description"
                name="description"
                valid={!!props.errors.description}
                error={props.touched.description && props.errors.description}
                notification={props.errors.description || f('descriptionCaption')}
                maxLength={100}
              />
            </Form>
            <Row>
              <SecondaryButton onClick={onClose}>
                {f('cancel')}
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={!props.isValid}
                             onClick={props.submitForm}>{group ? f('create') : f('update')}</PrimaryButton>
            </Row>
          </>
        )}
      </Formik>
    </Modal>
  );
}
export default ModifyGroupModal;
