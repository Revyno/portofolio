"use client";

import { useState } from "react";
import {
  ChakraProvider,
  Box,
  Flex,
  Button,
  IconButton,
  Table,
  Dialog,
  Field,
  Input,
  Textarea,
  Switch,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { journeySystem } from "./journey-system";
import { useJourney, saveJourney, deleteJourney, toggleJourneyPublished } from "@/lib/store";
import { toast } from "@/lib/toast";
import type { Journey } from "@/lib/data";
import { TabHead } from "./Shell";

type Draft = { date: string; title: string; org: string; note: string; published: boolean };
const EMPTY: Draft = { date: "", title: "", org: "", note: "", published: false };

/** CMS Journey tab — Chakra UI, scoped Swiss/dark system (radius 0, accent #4CE0FF). */
export function JourneyTab() {
  return (
    <ChakraProvider value={journeySystem}>
      <JourneyInner />
    </ChakraProvider>
  );
}

function JourneyInner() {
  const journey = useJourney();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);

  function openNew() {
    setDraft(EMPTY);
    setEditing("new");
  }
  function openEdit(j: Journey) {
    setDraft({ date: j.date, title: j.title, org: j.org, note: j.note, published: j.published });
    setEditing(j.id);
  }
  function commit() {
    saveJourney({ id: editing === "new" ? undefined : editing!, ...draft });
    toast(editing === "new" ? "Milestone created" : "Milestone saved");
    setEditing(null);
  }

  const open = editing !== null;

  return (
    <Box>
      <TabHead
        title="Journey"
        sub={`${journey.length} milestones`}
        action={
          <Button
            onClick={openNew}
            bg="accent"
            color="#0b0b0b"
            borderRadius="none"
            fontSize="11px"
            letterSpacing="0.14em"
            textTransform="uppercase"
            px="18px"
            h="38px"
            fontWeight="500"
            _hover={{ bg: "white" }}
          >
            + New milestone
          </Button>
        }
      />

      <Box border="1px solid" borderColor="line">
        <Table.Root size="sm" css={{ "& td, & th": { borderColor: "var(--chakra-colors-line)" } }}>
          <Table.Header>
            <Table.Row bg="s1">
              <Th>Date</Th>
              <Th>Title</Th>
              <Th>Org</Th>
              <Th>Status</Th>
              <Th textAlign="right">Actions</Th>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {journey.map((j) => (
              <Table.Row key={j.id} _hover={{ bg: "rgba(76,224,255,0.05)" }}>
                <Td>
                  <Text fontFamily="mono" fontSize="12px" color="muted">
                    {j.date}
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="14px" fontWeight="500" color="white">
                    {j.title}
                  </Text>
                  <Text fontSize="12px" color="muted" lineClamp={1}>
                    {j.note}
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="13px" color="body">
                    {j.org}
                  </Text>
                </Td>
                <Td>
                  <Button
                    onClick={() => toggleJourneyPublished(j.id)}
                    variant="outline"
                    borderRadius="none"
                    size="xs"
                    fontFamily="mono"
                    fontSize="9px"
                    letterSpacing="0.14em"
                    textTransform="uppercase"
                    borderColor="lineBox"
                    color={j.published ? "accent" : "muted"}
                  >
                    {j.published ? "● Live" : "○ Draft"}
                  </Button>
                </Td>
                <Td textAlign="right">
                  <Flex justify="flex-end" gap="3">
                    <ActionBtn onClick={() => openEdit(j)}>Edit</ActionBtn>
                    <ActionBtn
                      danger
                      onClick={() => {
                        if (confirm(`Delete “${j.title}”?`)) {
                          deleteJourney(j.id);
                          toast("Milestone deleted");
                        }
                      }}
                    >
                      Del
                    </ActionBtn>
                  </Flex>
                </Td>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      <Dialog.Root
        open={open}
        onOpenChange={(e) => !e.open && setEditing(null)}
        placement="center"
        size="md"
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" />
          <Dialog.Positioner>
            <Dialog.Content bg="s1" border="1px solid" borderColor="lineBox" borderRadius="none" color="white">
              <Dialog.Header borderBottom="1px solid" borderColor="line">
                <Dialog.Title fontSize="18px" fontWeight="700" letterSpacing="-0.02em">
                  {editing === "new" ? "New milestone" : "Edit milestone"}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap="4">
                  <Field.Root>
                    <Lbl>Date</Lbl>
                    <Fld type="date" value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} />
                  </Field.Root>
                  <Field.Root>
                    <Lbl>Title</Lbl>
                    <Fld value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="Full-stack Developer" />
                  </Field.Root>
                  <Field.Root>
                    <Lbl>Organisation</Lbl>
                    <Fld value={draft.org} onChange={(e) => setDraft((d) => ({ ...d, org: e.target.value }))} placeholder="Independent" />
                  </Field.Root>
                  <Field.Root>
                    <Lbl>Note</Lbl>
                    <Textarea
                      rows={3}
                      value={draft.note}
                      onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
                      placeholder="One or two sentences"
                      bg="field"
                      border="1px solid"
                      borderColor="lineBox"
                      borderRadius="none"
                      fontSize="14px"
                      _focus={{ borderColor: "accent", boxShadow: "none", outline: "none" }}
                    />
                  </Field.Root>
                  <Flex align="center" justify="space-between" borderTop="1px solid" borderColor="line" pt="4">
                    <Text fontSize="14px">Published</Text>
                    <Switch.Root
                      checked={draft.published}
                      onCheckedChange={(e) => setDraft((d) => ({ ...d, published: e.checked }))}
                      colorPalette="cyan"
                    >
                      <Switch.HiddenInput />
                      <Switch.Control borderRadius="none">
                        <Switch.Thumb borderRadius="none" />
                      </Switch.Control>
                    </Switch.Root>
                  </Flex>
                </Stack>
              </Dialog.Body>
              <Dialog.Footer borderTop="1px solid" borderColor="line" gap="3">
                <Button variant="outline" borderRadius="none" borderColor="lineBox" color="body" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button bg="accent" color="#0b0b0b" borderRadius="none" _hover={{ bg: "white" }} onClick={commit}>
                  Save
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}

// --- small local presentational helpers (keep the JSX above readable) --------
function Th({ children, textAlign }: { children: React.ReactNode; textAlign?: "right" }) {
  return (
    <Table.ColumnHeader
      fontFamily="mono"
      fontSize="9px"
      letterSpacing="0.14em"
      textTransform="uppercase"
      color="muted"
      textAlign={textAlign}
      borderColor="line"
    >
      {children}
    </Table.ColumnHeader>
  );
}
function Td({ children, textAlign }: { children: React.ReactNode; textAlign?: "right" }) {
  return (
    <Table.Cell borderColor="line" textAlign={textAlign} verticalAlign="top">
      {children}
    </Table.Cell>
  );
}
function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <Field.Label fontFamily="mono" fontSize="9px" letterSpacing="0.14em" textTransform="uppercase" color="muted" mb="2">
      {children}
    </Field.Label>
  );
}
function Fld(props: React.ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
      bg="field"
      border="1px solid"
      borderColor="lineBox"
      borderRadius="none"
      fontSize="14px"
      h="40px"
      _focus={{ borderColor: "accent", boxShadow: "none", outline: "none" }}
    />
  );
}
function ActionBtn({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <IconButton
      aria-label={String(children)}
      onClick={onClick}
      variant="plain"
      w="auto"
      minW="auto"
      h="auto"
      fontFamily="mono"
      fontSize="10px"
      letterSpacing="0.14em"
      textTransform="uppercase"
      color="muted"
      _hover={{ color: danger ? "#ff6b6b" : "white" }}
    >
      {children}
    </IconButton>
  );
}
