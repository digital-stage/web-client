import React from 'react';
import { connect, ConnectedProps } from 'react-redux'
import {reportError} from '../redux/actions/clientActions'

const connector = connect(null, {reportError})

type PropsFromRedux = ConnectedProps<typeof connector>

interface Props extends PropsFromRedux {
    children: React.ReactNode
}

class ErrorBoundaryWithRedux extends React.Component<Props> {
    state = {
        error: '',
        errorInfo: '',
        hasError: false,
    };

    static getDerivedStateFromError(error) {
        return {hasError: true, error};
    }

    componentDidCatch(error, errorInfo) {
        // eslint-disable-next-line no-console
        console.error({error, errorInfo});
        this.props.reportError(error, errorInfo)
        /*
        Sentry.withScope((scope) => {
            scope.setExtras(errorInfo);
            const eventId = Sentry.captureException(error);
            this.setState({ eventId, errorInfo });
        });*/
        this.setState({errorInfo});
    }

    render() {
        return this.props.children
    }
}

const ErrorBoundary = connector(ErrorBoundaryWithRedux)

export {ErrorBoundary}