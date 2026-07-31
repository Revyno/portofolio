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
  Switch,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { journeySystem } from "./journey-system";
import { useCertificates, saveCertificate, deleteCertificate, toggleCertificatePublished } from "@/lib/store";
import { toast } from "@/lib/toast";
import type { Certificate } from "@/lib/data";
import { TabHead } from "./Shell";
import { Dropzone } from "./ui";

type Draft = { year: string; title: string; venue: string; coverUrl: string | null; linkUrl: string; published: boolean };
const EMPTY: Draft = { year: "", title: "", venue: "", coverUrl: null, linkUrl: "", published: false };

/** CMS Certificate tab — same scoped Swiss/dark Chakra system as Journey. */
export function CertificateTab() {
  return (
    <ChakraProvider value={journeySystem}>
      <CertificateInner />
    </ChakraProvider>
  );
}

function CertificateInner() {
  const certificates = useCertificates();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);

  function openNew() {
    setDraft(EMPTY);
    setEditing("new");
  }
  function openEdit(c: Certificate) {
    setDraft({ year: c.year, title: c.title, venue: c.venue, coverUrl: c.coverUrl, linkUrl: c.linkUrl ?? "", published: c.published });
    setEditing(c.id);
  }
  function commit() {
    saveCertificate({
      id: editing === "new" ? undefined : editing!,
      ...draft,
      linkUrl: draft.linkUrl.trim() || null,
    });
    toast(editing === "new" ? "Certificate created" : "Certificate saved");
    setEditing(null);
  }

  const open = editing !== null;

  return (
    <Box>
      <TabHead
        title="Certificate"
        sub={`${certificates.length} certificates`}
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
            + New certificate
          </Button>
        }
      />

      <Box border="1px solid" borderColor="line">
        <Table.Root size="sm" css={{ "& td, & th": { borderColor: "var(--chakra-colors-line)" } }}>
          <Table.Header>
            <Table.Row bg="s1">
              <Th>Cover</Th>
              <Th>Year</Th>
              <Th>Title</Th>
              <Th>Venue</Th>
              <Th>Status</Th>
              <Th textAlign="right">Actions</Th>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {certificates.map((c) => (
              <Table.Row key={c.id} _hover={{ bg: "rgba(76,224,255,0.05)" }}>
                <Td>
                  {c.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.coverUrl} alt={c.title} style={{ width: 56, height: 40, objectFit: "cover", border: "1px solid var(--chakra-colors-line)" }} />
                  ) : (
                    <Box w="56px" h="40px" border="1px solid" borderColor="line" display="flex" alignItems="center" justifyContent="center">
                      <Text fontFamily="mono" fontSize="9px" color="muted">—</Text>
                    </Box>
                  )}
                </Td>
                <Td>
                  <Text fontFamily="mono" fontSize="12px" color="muted">
                    {c.year}
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="14px" fontWeight="500" color="white">
                    {c.title}
                  </Text>
                  {c.linkUrl && (
                    <Text fontFamily="mono" fontSize="10px" color="accent" lineClamp={1}>
                      ↗ link
                    </Text>
                  )}
                </Td>
                <Td>
                  <Text fontSize="13px" color="body">
                    {c.venue}
                  </Text>
                </Td>
                <Td>
                  <Button
                    onClick={() => toggleCertificatePublished(c.id)}
                    variant="outline"
                    borderRadius="none"
                    size="xs"
                    fontFamily="mono"
                    fontSize="9px"
                    letterSpacing="0.14em"
                    textTransform="uppercase"
                    borderColor="lineBox"
                    color={c.published ? "accent" : "muted"}
                  >
                    {c.published ? "● Live" : "○ Draft"}
                  </Button>
                </Td>
                <Td textAlign="right">
                  <Flex justify="flex-end" gap="3">
                    <ActionBtn onClick={() => openEdit(c)}>Edit</ActionBtn>
                    <ActionBtn
                      danger
                      onClick={() => {
                        if (confirm(`Delete “${c.title}”?`)) {
                          deleteCertificate(c.id);
                          toast("Certificate deleted");
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
                  {editing === "new" ? "New certificate" : "Edit certificate"}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap="4">
                  <Field.Root>
                    <Lbl>Year</Lbl>
                    <Fld value={draft.year} onChange={(e) => setDraft((d) => ({ ...d, year: e.target.value }))} placeholder="2026" />
                  </Field.Root>
                  <Field.Root>
                    <Lbl>Title</Lbl>
                    <Fld value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="Self-hosting a CMS without a CMS" />
                  </Field.Root>
                  <Field.Root>
                    <Lbl>Venue</Lbl>
                    <Fld value={draft.venue} onChange={(e) => setDraft((d) => ({ ...d, venue: e.target.value }))} placeholder="JS Meetup ID" />
                  </Field.Root>
                  <Field.Root>
                    <Lbl>View link (Google Drive / URL)</Lbl>
                    <Fld
                      type="url"
                      value={draft.linkUrl}
                      onChange={(e) => setDraft((d) => ({ ...d, linkUrl: e.target.value }))}
                      placeholder="https://drive.google.com/file/d/…/view"
                    />
                  </Field.Root>
                  <Field.Root>
                    <Lbl>Cover image</Lbl>
                    {draft.coverUrl ? (
                      <Box position="relative" w="100%" border="1px solid" borderColor="lineBox">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={draft.coverUrl} alt="cover" style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }} />
                        <Button
                          onClick={() => setDraft((d) => ({ ...d, coverUrl: null }))}
                          position="absolute"
                          top="2"
                          right="2"
                          bg="blackAlpha.700"
                          color="white"
                          borderRadius="none"
                          size="xs"
                          fontFamily="mono"
                          fontSize="9px"
                          letterSpacing="0.14em"
                          textTransform="uppercase"
                          _hover={{ bg: "blackAlpha.800" }}
                        >
                          Replace ✕
                        </Button>
                      </Box>
                    ) : (
                      <Box w="100%">
                        <Dropzone onFile={(url) => setDraft((d) => ({ ...d, coverUrl: url }))} hint="Drop certificate image" height={140} />
                      </Box>
                    )}
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

// --- small local presentational helpers (mirror JourneyTab) ------------------
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
