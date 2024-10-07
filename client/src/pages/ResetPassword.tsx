import {
  Alert,
  AlertIcon,
  Container,
  Flex,
  Text,
  VStack,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link, useSearchParams } from 'react-router-dom';
import ResetPasswordForm from '../components/ResetPasswordForm';

function ResetPassword() {
  // extract params for url
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const exp = Number(searchParams.get('exp'));
  const now = Date.now();
  // is valid if there's a code and exp, and if expiration date is greater than date
  const linkIsValid = code && exp && exp > now;

  return (
    <Flex minH='100vh' justify='center'>
      <Container mx='auto' maxW='md' py={12} px={6} textAlign='center'>
        {linkIsValid ? (
          <ResetPasswordForm code={code} />
        ) : (
          <VStack align='center' spacing={6}>
            <Alert status='error' w='fit-content' borderRadius={12}>
              <AlertIcon />
              Invalid Link
            </Alert>
            <Text color='gray.400'>The link is either invalid or expired.</Text>
            <ChakraLink as={Link} to='/password/forgot' replace>
              Request a new password reset link
            </ChakraLink>
          </VStack>
        )}
      </Container>
    </Flex>
  );
}

export default ResetPassword;
