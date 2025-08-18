export default interface AlertProp {
    open: boolean;
    type: 'error' | 'success';
    message: string;
}