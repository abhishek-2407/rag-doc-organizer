import { MessageList } from "@/components/ChatSection/MessageList";
import { useChatMessages } from "@/components/ChatSection/useChatMessages";
import {
  handleCreateRAG,
  handleDeleteFile,
  handleFileSelection,
  handleUploadDocuments,
} from "@/components/DocumentManager/fileUtils";
import {
  FilesByFolder,
  useDocumentManager,
} from "@/components/DocumentManager/useDocumentManager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { UserId, TestsFolder, ApiUrl } from "@/Constants";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  UseMutationResult,
  useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import {
  FileIcon,
  Loader2Icon,
  Plus,
  X,
  XIcon,
  RefreshCwIcon,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const testCaseSchema = z.object({
  file_id_list: z.array(z.string()),
  prompt: z.string().min(1),
  expected_output: z.string().min(1),
});

type TestCaseType = z.infer<typeof testCaseSchema>;

export default function Testing() {
  const {
    newFolderName,
    setNewFolderName,
    newChildFolderName,
    setNewChildFolderName,
    parentFolderForChildFolder,
    setParentFolderForChildFolder,
    filesByFolder,
    setFilesByFolder,
    folderStructure,
    setFolderStructure,
    pendingUploads,
    setPendingUploads,
    loadingUpload,
    setLoadingUpload,
    loadingRAG,
    setLoadingRAG,
    loadingDelete,
    setLoadingDelete,
    loadingFiles,
    collapsedFolders,
    setCollapsedFolders,
    selectedFolder,
    setSelectedFolder,
    isModalOpen,
    setIsModalOpen,
  } = useDocumentManager();

  type TestCase = {
    id?: string;
    files: string[];
    query: string;
    expected_output: string;
  };

  const deleteTestcaseMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`${ApiUrl}/testcases/${id}`);
      testCasesQuery.refetch();
      return response.data;
    },
  });

  const testCasesQuery = useQuery({
    queryKey: ["testcases"],
    queryFn: async () => {
      const response = await axios.get(`${ApiUrl}/testcases/`);
      return response.data as (TestCaseType & {
        id: string;
        files: { file_id: string; file_name: string }[];
      })[];
    },
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchInterval: 0,
  });

  const form = useForm<TestCaseType>({
    resolver: zodResolver(testCaseSchema),
    defaultValues: {
      file_id_list: [],
      prompt: "",
      expected_output: "",
    },
  });

  useEffect(() => {
    if (!filesByFolder[TestsFolder] || filesByFolder[TestsFolder]?.length < 1)
      return;

    filesByFolder[TestsFolder].forEach(async (file: any) => {
      !file.rag_status &&
        (await handleCreateRAG(
          file.file_id,
          TestsFolder,
          loadingRAG,
          setLoadingRAG,
          filesByFolder,
          setFilesByFolder
        ));
    });
  }, [pendingUploads]);

  function onSubmit(values: TestCase) {
    toast.promise(
      async function () {
        const response = await axios.post(`${ApiUrl}/testcases/`, {
          ...values,
        });

        testCasesQuery.refetch();

        return response;
      },
      {
        loading: "Adding testcase",
        success: (e) => "Successfully created test case",
        error: (e) => {
          console.error(e);
          return "Failed to add testcase";
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-2 p-4 gap-2"
      >
        <div className="grid gap-2">
          <Input
            type="file"
            multiple
            onChange={(e) =>
              handleFileSelection(
                e,
                TestsFolder,
                pendingUploads,
                setPendingUploads
              )
            }
            accept="application/pdf"
          />

          <Button
            type="button"
            onClick={() =>
              handleUploadDocuments(
                TestsFolder,
                pendingUploads,
                setPendingUploads,
                loadingUpload,
                setLoadingUpload,
                filesByFolder,
                setFilesByFolder
              )
            }
            disabled={
              loadingUpload[TestsFolder] ||
              !(pendingUploads[TestsFolder]?.length > 0)
            }
          >
            {loadingUpload[TestsFolder] ? "Uploading..." : "Upload Files"}
          </Button>

          <div>
            {(pendingUploads[TestsFolder] || []).length > 0 && (
              <div className="bg-gray-700 rounded-lg p-3 mb-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  Pending Uploads:
                </h4>
                <ul className="space-y-1">
                  {pendingUploads[TestsFolder].map(
                    (file: File, idx: number) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center text-sm text-white"
                      >
                        <span className="truncate flex-1">{file.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setPendingUploads((prev: any) => ({
                              ...prev,
                              [TestsFolder]: prev[TestsFolder].filter(
                                (_: any, i: number) => i !== idx
                              ),
                            }))
                          }
                          className="ml-2 text-gray-400 hover:text-red-400 transition p-1"
                        >
                          <X size={14} />
                        </button>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {filesByFolder[TestsFolder]?.length > 0 ? (
              <div className="overflow-x-auto">
                <Table className="w-full text-sm text-left text-gray-300">
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead>File</TableHead>
                      <TableHead>RAG Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filesByFolder[TestsFolder].map((file: any) => (
                      <TableRow key={file.file_id}>
                        <TableCell>
                          <Checkbox
                            value={form
                              .getValues("file_id_list")
                              .find((f) => f === file.file_id)}
                            onCheckedChange={(checked) => {
                              if (checked)
                                form.setValue(
                                  "file_id_list",
                                  Array.from(
                                    new Set([
                                      file.file_id,
                                      ...form.getValues("file_id_list"),
                                    ])
                                  )
                                );
                              else
                                form.setValue(
                                  "file_id_list",
                                  form
                                    .getValues("file_id_list")
                                    .filter(
                                      (file_id) => file_id !== file.file_id
                                    )
                                );
                            }}
                          />
                        </TableCell>
                        <TableCell>{file.file_name}</TableCell>
                        <TableCell>
                          {file.rag_status ? (
                            <span className="text-green-400 flex items-center gap-2">
                              ✓ Complete{" "}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-8"
                                type="button"
                                onClick={() => {
                                  toast.promise(
                                    handleCreateRAG(
                                      file.file_id,
                                      TestsFolder,
                                      loadingRAG,
                                      setLoadingRAG,
                                      filesByFolder,
                                      setFilesByFolder
                                    ),
                                    {
                                      loading: "Re-creating RAG",
                                    }
                                  );
                                }}
                              >
                                <RefreshCwIcon className="size-2" />
                              </Button>
                            </span>
                          ) : (
                            <span className="text-yellow-400">Pending</span>
                          )}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          {!file.rag_status && (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() =>
                                handleCreateRAG(
                                  file.file_id,
                                  TestsFolder,
                                  loadingRAG,
                                  setLoadingRAG,
                                  filesByFolder,
                                  setFilesByFolder
                                )
                              }
                              disabled={loadingRAG[file.file_id]}
                              className="bg-amber-600 hover:bg-amber-700 h-8 text-xs"
                            >
                              {loadingRAG[file.file_id]
                                ? "Creating..."
                                : "Create RAG"}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            type="button"
                            variant="destructive"
                            onClick={() =>
                              handleDeleteFile(
                                file.file_id,
                                TestsFolder,
                                loadingDelete,
                                setLoadingDelete,
                                filesByFolder,
                                setFilesByFolder
                              )
                            }
                            disabled={loadingDelete[file.file_id]}
                            className="h-8 text-xs"
                          >
                            {loadingDelete[file.file_id]
                              ? "Deleting..."
                              : "Delete"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center p-4 text-gray-400 italic">
                No files in this folder
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-rows-2 gap-4">
          <div className="h-full flex flex-col gap-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              name="prompt"
              {...form.register("prompt")}
              className="h-full"
            />
            {form.formState.errors["prompt"] && (
              <p className="text-destructive text-sm font-medium">
                {form.formState.errors["prompt"].message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="expected_output">Expected Output</Label>
            <Textarea
              className="h-full"
              name="expected_output"
              {...form.register("expected_output")}
            />
            {form.formState.errors["expected_output"] && (
              <p className="text-destructive text-sm font-medium">
                {form.formState.errors["expected_output"].message}
              </p>
            )}
          </div>
        </div>

        <Button
          disabled={form.formState.isSubmitting}
          className="col-span-full"
        >
          Add Test Case
        </Button>
      </form>

      <div className="p-4 flex flex-col gap-4">
        {testCasesQuery.data &&
          testCasesQuery.data.map((e) => (
            <TestcaseCard
              key={e.id}
              filesByFolder={filesByFolder}
              testcase={e}
              deleteTestcaseMutation={deleteTestcaseMutation}
            />
          ))}
      </div>
    </div>
  );
}

function TestcaseCard({
  filesByFolder,
  testcase,
  deleteTestcaseMutation,
}: {
  filesByFolder: FilesByFolder;
  testcase: TestCaseType & {
    id: string;
    files: { file_id: string; file_name: string }[];
  };
  deleteTestcaseMutation: UseMutationResult;
}) {
  const files = useMemo(
    () =>
      testcase.files.map(
        (t) =>
          filesByFolder[TestsFolder].filter((f) => f.file_id == t.file_id)[0] ??
          undefined
      ) ?? [],
    [testcase]
  );

  const {
    messages,
    setMessages,
    inputMessage,
    setInputMessage,
    isLoading,
    handleSubmit,
    chatContainerRef,
    setSelectedFiles,
  } = useChatMessages();

  useEffect(() => {
    setMessages([]);
    setInputMessage(testcase.prompt);
    setSelectedFiles(files);
    handleSubmit();
  }, [testcase.prompt]);

  return (
    <div className="border p-4 rounded relative">
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-0 right-0"
        onClick={() => {
          toast.warning(`Confirm delete testcase: ${testcase.id}`, {
            action: {
              label: "Confirm",
              onClick: () =>
                toast.promise(deleteTestcaseMutation.mutateAsync(testcase.id), {
                  loading: "Deleting testcase",
                  success: "Deleted testcase",
                  error: (e) => {
                    console.error(e);
                    return "Failed to delete testcase";
                  },
                }),
            },
          });
        }}
      >
        <XIcon />
      </Button>
      <div className="grid gap-4">
        <div className="flex gap-2">
          {files.map((e) => e && <Badge key={e.file_id}>{e.file_name}</Badge>)}
        </div>

        <div className="grid grid-cols-2 gap-4 bg-secondary py-2 px-4 rounded-lg">
          <div className="grid gap-1">
            <h3 className="text-sm font-medium text-muted-foreground">
              Prompt
            </h3>
            <p>{testcase.prompt}</p>
          </div>

          <div className="grid gap-1">
            <h3 className="text-sm font-medium text-muted-foreground">
              Expected Output
            </h3>
            <p>{testcase.expected_output}</p>
          </div>
        </div>

        <div>
          <ScrollArea className="chat-messages" ref={chatContainerRef}>
            <MessageList messages={messages} />
          </ScrollArea>

          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </div>
    </div>
  );
}
