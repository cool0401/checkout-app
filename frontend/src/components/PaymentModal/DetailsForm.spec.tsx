import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils/renderWithProviders';
import DetailsForm from './DetailsForm';

function fillValidForm() {
  fireEvent.change(screen.getByPlaceholderText('4242 4242 4242 4242'), { target: { value: '4242424242424242' } });
  fireEvent.change(screen.getByLabelText(/cardholder name/i), { target: { value: 'Jane Doe' } });
  fireEvent.change(screen.getByPlaceholderText('MM'), { target: { value: '12' } });
  fireEvent.change(screen.getByPlaceholderText('YYYY'), { target: { value: '2099' } });
  fireEvent.change(screen.getByLabelText(/cvc/i), { target: { value: '123' } });

  fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Jane Doe' } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
  fireEvent.change(screen.getAllByLabelText(/phone/i)[0], { target: { value: '3001234567' } });
  fireEvent.change(screen.getByLabelText(/id number/i), { target: { value: '123456789' } });

  fireEvent.change(screen.getByLabelText(/address/i), { target: { value: 'Cra 1 # 2-3' } });
  fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Bogota' } });
  fireEvent.change(screen.getByLabelText(/region/i), { target: { value: 'Cundinamarca' } });
  fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: '110111' } });
  fireEvent.change(screen.getByLabelText(/delivery phone/i), { target: { value: '3001234567' } });
}

describe('DetailsForm', () => {
  it('shows validation errors and does not submit when the form is empty', () => {
    const onSubmitted = jest.fn();
    const { store } = renderWithProviders(<DetailsForm initialCard={null} onSubmitted={onSubmitted} />);

    fireEvent.click(screen.getByRole('button', { name: /continue to summary/i }));

    expect(onSubmitted).not.toHaveBeenCalled();
    expect(store.getState().checkout.step).toBe('idle');
    expect(screen.getByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Card number is required')).toBeInTheDocument();
  });

  it('rejects a Luhn-invalid card number and an unsupported brand distinctly', () => {
    renderWithProviders(<DetailsForm initialCard={null} onSubmitted={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('4242 4242 4242 4242'), { target: { value: '4242424242424241' } });
    fireEvent.click(screen.getByRole('button', { name: /continue to summary/i }));
    expect(screen.getByText('Enter a valid card number')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('4242 4242 4242 4242'), { target: { value: '6011111111111117' } });
    fireEvent.click(screen.getByRole('button', { name: /continue to summary/i }));
    expect(screen.getByText('Only Visa and Mastercard are supported')).toBeInTheDocument();
  });

  it('detects the card brand as the user types', () => {
    renderWithProviders(<DetailsForm initialCard={null} onSubmitted={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('4242 4242 4242 4242'), { target: { value: '4242' } });
    expect(screen.getByText('VISA')).toBeInTheDocument();
  });

  it('submits customer/delivery to the store and lifts the card fields to the parent', () => {
    const onSubmitted = jest.fn();
    const { store } = renderWithProviders(<DetailsForm initialCard={null} onSubmitted={onSubmitted} />);

    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: /continue to summary/i }));

    expect(onSubmitted).toHaveBeenCalledWith({
      number: '4242424242424242',
      cvc: '123',
      expMonth: '12',
      expYear: '2099',
      cardHolder: 'Jane Doe',
      installments: 1,
    });

    const state = store.getState().checkout;
    expect(state.step).toBe('summary');
    expect(state.customer?.email).toBe('jane@example.com');
    expect(state.delivery?.city).toBe('Bogota');
  });
});
