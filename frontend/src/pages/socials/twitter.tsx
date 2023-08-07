import { ReactElement, useState, useEffect } from 'react';

import {
  Affix,
  Alert,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  Paper,
  PasswordInput,
  Text,
  Title,
  Transition,
  useMantineTheme,
} from '@mantine/core';
import { MainLayout } from '../../components/Layout/mainLayout';
import { APIResponse, UserInt as User } from '../../utils/types';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Prism } from '@mantine/prism';
import { useWindowScroll } from '@mantine/hooks';
import { IconArrowUp } from '@tabler/icons-react';
import TwitterService, {
  TwitterSettingsInt,
} from '../../utils/api/TwitterService';

type FormTwitterSettingsInput = {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
};

const schema = z.object({
  consumerKey: z.string().min(1, {
    message: 'Twitter Consumer Key is required',
  }),
  consumerSecret: z.string().min(1, {
    message: 'Twitter Consumer Secret is required',
  }),
  accessToken: z.string().min(1, {
    message: 'Twitter Access Token is required',
  }),
  accessTokenSecret: z.string().min(1, {
    message: 'Twitter Access Token Secret is required',
  }),
});

type Test = {
  ran: boolean;
  result: APIResponse<any> | null;
  running: boolean;
  success: boolean;
};

export default function Home({
  user,
  isBlurred,
}: {
  user: User;
  isBlurred: boolean;
}) {
  const theme = useMantineTheme();
  const [submitting, setSubmitting] = useState(false);
  const [update, setUpdate] = useState(false);
  const [getTest, setGetTest] = useState<Test>({
    ran: false,
    result: null,
    running: false,
    success: false,
  });
  const [postTest, setPostTest] = useState<Test>({
    ran: false,
    result: null,
    running: false,
    success: false,
  });
  const [scroll, scrollTo] = useWindowScroll();

  const {
    data: settings,
    isLoading,
    isError,
  } = useQuery(
    ['twitterSettings'],
    async () => {
      const response = await TwitterService.getOne();
      if (response.success) {
        return response.data;
      } else {
        return null;
      }
    } // query function
  );

  const defaultValues = {
    consumerKey: settings?.consumerKey ?? '',
    consumerSecret: settings?.consumerSecret ?? '',
    accessToken: settings?.accessToken ?? '',
    accessTokenSecret: settings?.accessTokenSecret ?? '',
  };

  const {
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
  } = useForm<FormTwitterSettingsInput>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const queryClient = useQueryClient();
  const createTwitterSettingsMutation = useMutation(
    async (data: FormTwitterSettingsInput) => TwitterService.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['twitterSettings']).finally(() => {});
        setSubmitting(false);
        toast.success('Twitter settings updated successfully!');
      },
      onError: (response: APIResponse<TwitterSettingsInt>) => {
        if (response.error)
          toast.error(
            `Error creating class: ${response.error.response?.data?.msg ?? ''}`
          );
        setSubmitting(false);
        // Display an error message to the user or redirect to an error page
      },
      onMutate: () => {
        setSubmitting(true);
        setGetTest({
          ran: false,
          result: null,
          running: false,
          success: false,
        });
      },
    }
  );

  const updateTwitterSettingsMutation = useMutation(
    async (data: FormTwitterSettingsInput) => TwitterService.update(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['twitterSettings']).finally(() => {});
        setSubmitting(false);
        toast.success('Twitter settings updated successfully!');
      },
      onError: (response: APIResponse<TwitterSettingsInt>) => {
        if (response.error)
          toast.error(
            `Error creating class: ${response.error.response?.data?.msg ?? ''}`
          );
        setSubmitting(false);
        // Display an error message to the user or redirect to an error page
      },
      onMutate: () => {
        setSubmitting(true);
        setGetTest({
          ran: false,
          result: null,
          running: false,
          success: false,
        });
      },
    }
  );

  const handleGetTest = async () => {
    if (settings) {
      setGetTest({
        ran: false,
        result: null,
        running: true,
        success: false,
      });
      const response = await TwitterService.testGet();
      if (response.success) {
        toast.success('Connection successful!');
      } else {
        toast.error('Connection failed!');
      }
      setGetTest({
        ran: true,
        result: response,
        running: false,
        success: response.success,
      });
    }
  };

  const handlePostTest = async () => {
    if (settings) {
      setPostTest({
        ran: false,
        result: null,
        running: true,
        success: false,
      });
      const response = await TwitterService.testPost();
      if (response.success) {
        toast.success('Connection successful!');
      } else {
        toast.error('Connection failed!');
      }
      setPostTest({
        ran: true,
        result: response,
        running: false,
        success: response.success,
      });
    }
  };

  useEffect(() => {
    if (settings) {
      setUpdate(true);
      reset(settings);
    }
  }, [settings, reset]);

  return (
    <>
      <Center>
        <Title>Twitter Settings</Title>
      </Center>
      <Container size={'md'}>
        <Box pos="relative">
          <LoadingOverlay visible={isLoading} overlayBlur={2} />
          <Paper
            mt={100}
            p={'xl'}
            sx={{
              border: `3px solid ${
                theme.colorScheme === 'dark'
                  ? theme.colors.dark[4]
                  : theme.colors.gray[2]
              }`,
            }}
          >
            {!isLoading && !settings && !isError && (
              <Alert mb={20}>
                <b>Warning:</b> You have not set up your Twitter settings yet.
                You will not be able to use the Twitter bot until you do so.
              </Alert>
            )}
            {!isLoading && isError && (
              <Alert mb={20} color="red">
                <b>Error:</b> Could not load Twitter settings. Please try again,
                or contact the developer.
              </Alert>
            )}
            <form
              onSubmit={handleSubmit((data) =>
                update
                  ? updateTwitterSettingsMutation.mutate(data)
                  : createTwitterSettingsMutation.mutate(data)
              )}
            >
              <Text mb={20}>
                The Consumer Key and Consumer Secret are the API Key and API
                Secret. They are used to authenticate your Twitter App. These
                Don&apos;t need to be tied to a specific user, but they do need
                to be kept secret.
              </Text>
              <Controller
                name="consumerKey"
                control={control}
                render={({ field }) => (
                  <PasswordInput
                    label="Twitter Consumer Key"
                    placeholder="Twitter Consumer Key"
                    withAsterisk
                    error={errors.consumerKey?.message}
                    disabled={isBlurred}
                    mb={30}
                    {...field}
                    description="This is the Consumer Key of the Twitter App. You can get this from the Twitter Developer Console. Keep this secret! (This is also known as the API Key.)"
                  />
                )}
              />
              <Controller
                name="consumerSecret"
                control={control}
                render={({ field }) => (
                  <PasswordInput
                    label="Twitter Consumer Secret"
                    placeholder="Twitter Consumer Secret"
                    withAsterisk
                    error={errors.consumerSecret?.message}
                    disabled={isBlurred}
                    mb={30}
                    {...field}
                    description="This is the Consumer Secret of the Twitter App. You can get this from the Twitter Developer Console. Keep this secret! (This is also known as the API Secret Key.)"
                  />
                )}
              />
              <Divider my={20} />
              <Text mb={20}>
                The Access Token and Access Token Secret are used to
                authenticate your User Account Instead of a username and
                password. They are tied to a specific user, and they need to be
                kept secret.
                <Text size={'sm'} c="dimmed">
                  Note: These need to be for the account you want to post tweets
                  to.
                </Text>
              </Text>
              <Controller
                name="accessToken"
                control={control}
                render={({ field }) => (
                  <PasswordInput
                    label="Twitter Access Token"
                    placeholder="Twitter Access Token"
                    withAsterisk
                    error={errors.accessToken?.message}
                    disabled={isBlurred}
                    mb={30}
                    {...field}
                    description="This is the Access Token of the Twitter App. You can get this from the Twitter Developer Console. Keep this secret!"
                  />
                )}
              />
              <Controller
                name="accessTokenSecret"
                control={control}
                render={({ field }) => (
                  <PasswordInput
                    label="Twitter Access Token Secret"
                    placeholder="Twitter Access Token Secret"
                    withAsterisk
                    error={errors.accessTokenSecret?.message}
                    mb={30}
                    {...field}
                    disabled={isBlurred}
                    description="This is the Access Token Secret of the Twitter App. You can get this from the Twitter Developer Console. Keep this secret!"
                  />
                )}
              />

              <Group position="center">
                <Button
                  variant="gradient"
                  gradient={{
                    from: '#6838f1',
                    to: '#dc51f2',
                  }}
                  size="md"
                  radius="sm"
                  my={10}
                  styles={{
                    root: {
                      display: 'block',
                    },
                  }}
                  loading={submitting}
                  type="submit"
                  disabled={!isDirty}
                >
                  {update ? 'Update' : 'Save'}
                </Button>
                <Button
                  variant="light"
                  color="gray"
                  size="md"
                  radius="sm"
                  my={10}
                  styles={{
                    root: {
                      display: 'block',
                    },
                  }}
                  onClick={() => {
                    reset();
                  }}
                >
                  Cancel
                </Button>
              </Group>
            </form>
          </Paper>
          <Divider my={80} size={'md'} />
          <Paper
            mt={80}
            p={'xl'}
            sx={{
              border: `3px solid ${
                theme.colorScheme === 'dark'
                  ? theme.colors.dark[4]
                  : theme.colors.gray[2]
              }`,
            }}
          >
            <Group position="center" mt={10}>
              <Button
                variant="outline"
                color="violet"
                size="md"
                radius="sm"
                my={10}
                styles={{
                  root: {
                    display: 'block',
                  },
                }}
                onClick={handleGetTest}
                loading={getTest.running}
              >
                Test Connection With Get Request
              </Button>
            </Group>
            <Box
              p={'xl'}
              sx={{
                background: ` ${
                  theme.colorScheme === 'dark'
                    ? theme.colors.dark[4]
                    : theme.colors.gray[2]
                }`,
                borderRadius: theme.radius.sm,
                color: `${
                  theme.colorScheme === 'dark'
                    ? theme.colors.dark[0]
                    : theme.colors.gray[7]
                }`,
              }}
            >
              {getTest.ran ? (
                <>
                  {getTest.success ? (
                    <Alert
                      color="green"
                      title="Success!"
                      withCloseButton={false}
                      mb={10}
                    >
                      Connection successful! You should see your Twitter
                      details.
                    </Alert>
                  ) : (
                    <Alert
                      color="red"
                      title="Error!"
                      withCloseButton={false}
                      mb={10}
                    >
                      Connection failed! Please check your settings and try
                      again. If the problem persists, please contact the
                      developer.
                    </Alert>
                  )}
                  <Prism language="json">
                    {JSON.stringify(getTest.result, null, 2)}
                  </Prism>
                </>
              ) : (
                <>
                  <Prism language="json">
                    Run a test to see the result here.
                  </Prism>
                </>
              )}
            </Box>
          </Paper>
          <Paper
            mt={30}
            p={'xl'}
            sx={{
              border: `3px solid ${
                theme.colorScheme === 'dark'
                  ? theme.colors.dark[4]
                  : theme.colors.gray[2]
              }`,
            }}
          >
            <Group position="center" mt={10}>
              <Button
                variant="outline"
                color="violet"
                size="md"
                radius="sm"
                my={10}
                styles={{
                  root: {
                    display: 'block',
                  },
                }}
                onClick={handlePostTest}
                loading={postTest.running}
              >
                Test Connection With Post Request
              </Button>
            </Group>
            <Box
              p={'xl'}
              sx={{
                background: ` ${
                  theme.colorScheme === 'dark'
                    ? theme.colors.dark[4]
                    : theme.colors.gray[2]
                }`,
                borderRadius: theme.radius.sm,
                color: `${
                  theme.colorScheme === 'dark'
                    ? theme.colors.dark[0]
                    : theme.colors.gray[7]
                }`,
              }}
            >
              {postTest.ran ? (
                <>
                  {postTest.success ? (
                    <Alert
                      color="green"
                      title="Success!"
                      withCloseButton={false}
                      mb={10}
                    >
                      Connection successful! a tweet should have been posted to
                      your account.
                    </Alert>
                  ) : (
                    <Alert
                      color="red"
                      title="Error!"
                      withCloseButton={false}
                      mb={10}
                    >
                      Connection failed! Please check your settings and try
                      again. If the problem persists, please contact the
                      developer.
                    </Alert>
                  )}
                  <Prism language="json">
                    {JSON.stringify(postTest.result, null, 2)}
                  </Prism>
                </>
              ) : (
                <>
                  <Prism language="json">
                    Run a test to see the result here.
                  </Prism>
                </>
              )}
            </Box>
          </Paper>
        </Box>
      </Container>
      <Affix position={{ bottom: 20, right: 20 }}>
        <Transition transition="slide-up" mounted={scroll.y > 0}>
          {(transitionStyles) => (
            <Button
              leftIcon={<IconArrowUp size="1rem" />}
              style={transitionStyles}
              onClick={() => scrollTo({ y: 0 })}
              color="violet"
            >
              Scroll to top
            </Button>
          )}
        </Transition>
      </Affix>
    </>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
