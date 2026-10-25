import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { DemoNotice } from '@/components/shared/DemoNotice';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { SUBJECTS } from '@/features/courses';
import { isSubjectBlocked } from '@/features/experts/api/experts.api';
import { useCreateExpertRequest } from '@/features/experts/api/experts.mutations';
import { useExpertRequestsQuery } from '@/features/experts/api/experts.queries';
import { CertificatePicker } from '@/features/experts/components/CertificatePicker';
import type { ExpertRequest } from '@/features/experts/types';
import {
  validateExpertForm,
  type ExpertFormErrors,
  type ExpertFormValues,
} from '@/features/experts/validation';
import { capitalize } from '@/utils/format';

type FieldProps = { label: string; error?: string; children: ReactNode };

function Field({ label, error, children }: FieldProps) {
  return (
    <View className="gap-2">
      <Text variant="label">{label}</Text>
      {children}
      {error ? (
        <Text variant="caption" className="text-primary" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const subjectOptions = (requests: ExpertRequest[]) =>
  SUBJECTS.map((subject) => {
    const blocking = isSubjectBlocked(requests, subject)
      ? requests.find((r) => r.subject === subject && r.status !== 'rejected')
      : undefined;
    return {
      value: subject,
      label: subject,
      disabledReason: blocking ? capitalize(blocking.status) : undefined,
    };
  });

type FormProps = { requests: ExpertRequest[] };

function Form({ requests }: FormProps) {
  const create = useCreateExpertRequest();
  const [values, setValues] = useState<ExpertFormValues>({
    subject: null,
    // Most requests share a title; start from the latest one.
    title: requests[0]?.title ?? '',
    certificate: null,
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  // Errors show after the first submit attempt, then update live as fields are fixed.
  const errors: ExpertFormErrors = hasSubmitted ? validateExpertForm(values) : {};

  const update = <K extends keyof ExpertFormValues>(key: K, value: ExpertFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = () => {
    setHasSubmitted(true);
    const { subject, title, certificate } = values;
    if (!subject || !certificate || Object.keys(validateExpertForm(values)).length > 0) return;
    create.mutate(
      { subject, title, certificate },
      {
        // The requests list shows the new request; its demo notice explains nothing was sent.
        onSuccess: () => router.replace('/expert/requests'),
      },
    );
  };

  return (
    <ScrollView contentContainerClassName="gap-5 p-4 pb-10" keyboardShouldPersistTaps="handled">
      <DemoNotice>expert requests and certificates; changes reset when the app restarts</DemoNotice>
      <Text variant="body">
        Share your qualifications to become an expert in a field. Each field is reviewed separately.
      </Text>
      <Field label="Field" error={errors.subject}>
        <Select
          label="Field"
          placeholder="Choose a field"
          options={subjectOptions(requests)}
          value={values.subject}
          onChange={(subject) => update('subject', subject)}
          hasError={!!errors.subject}
        />
      </Field>
      <Field label="Title" error={errors.title}>
        <TextField
          value={values.title}
          onChangeText={(title) => update('title', title)}
          placeholder="e.g. PhD in Marine Biology, Licensed tour guide"
          accessibilityLabel="Title"
          autoCapitalize="words"
          returnKeyType="done"
          className={errors.title ? 'border-primary' : undefined}
        />
      </Field>
      <Field label="Certificate" error={errors.certificate}>
        <CertificatePicker
          value={values.certificate}
          onChange={(certificate) => update('certificate', certificate)}
          hasError={!!errors.certificate}
        />
      </Field>
      {create.isError ? (
        <Text variant="caption" className="text-primary" accessibilityLiveRegion="polite">
          {create.error.message}
        </Text>
      ) : null}
      <Button
        label={create.isPending ? 'Submitting…' : 'Submit request'}
        disabled={create.isPending}
        accessibilityState={{ busy: create.isPending }}
        onPress={handleSubmit}
        className="self-stretch"
      />
    </ScrollView>
  );
}

/** Loads existing requests (to block duplicate fields), then shows the form. */
export function ExpertRequestForm() {
  const { data, isPending, isError, refetch } = useExpertRequestsQuery();

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Form requests={data} />
    </KeyboardAvoidingView>
  );
}
