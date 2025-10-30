"use client";

import type { UIMessage } from "ai";
import { PaperclipIcon } from "lucide-react";
import Image from "next/image";
import { FaviconStack } from "@/components/ai-elements/favicon-stack";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";

interface ChatMessagesProps {
  messages: UIMessage[];
  isStreaming?: boolean;
}

interface SourceItem {
  url: string;
  title: string;
  publishedDate?: string;
}

interface WebSearchToolOutput {
  sources?: SourceItem[];
}

/**
 * Extract sources from webSearch tool results
 * Sources are already deduplicated by the tool
 */
function extractWebSearchSources(parts: UIMessage["parts"]): SourceItem[] {
  const sources: SourceItem[] = [];

  for (const part of parts) {
    const type = part.type as string;
    if (type === "tool-webSearch") {
      const output = (part as { output?: WebSearchToolOutput }).output;
      if (output?.sources) {
        sources.push(...output.sources);
      }
    }
  }

  return sources;
}

/**
 * Extract source-url parts from AI SDK
 */
function extractAiSdkSources(parts: UIMessage["parts"]): SourceItem[] {
  const sources: SourceItem[] = [];

  for (const part of parts) {
    if (part.type === "source-url") {
      const sourcePart = part as { url: string; title?: string };
      sources.push({
        url: sourcePart.url,
        title: sourcePart.title || sourcePart.url,
      });
    }
  }

  return sources;
}

/**
 * Extract file parts from message
 */
function extractFileParts(parts: UIMessage["parts"]) {
  return parts.filter((part) => part.type === "file");
}

export function ChatMessages({
  messages,
  isStreaming = false,
}: ChatMessagesProps) {
  return (
    <>
      {messages.map(({ parts, ...message }, index) => {
        // Extract text parts
        const textParts = parts.filter((part) => part.type === "text");
        const textContent = textParts
          .map((part) => (part.type === "text" ? part.text : ""))
          .join("");

        // Extract file parts
        const fileParts = extractFileParts(parts);

        // Extract sources from AI SDK and webSearch
        const aiSdkSources = extractAiSdkSources(parts);

        // Extract sources from webSearch tool results (already deduplicated)
        const webSearchSources = extractWebSearchSources(parts);

        // Combine sources and deduplicate between AI SDK and webSearch sources
        const allSources = [...aiSdkSources, ...webSearchSources];
        const uniqueSources = allSources.filter(
          (source, index, self) =>
            index === self.findIndex((s) => s.url === source.url),
        );

        // Check if this is the last (currently streaming) message
        const isLastMessage = index === messages.length - 1;

        // Show sources only after response is finished (not on the currently streaming message)
        const shouldShowSources =
          uniqueSources.length > 0 &&
          message.role === "assistant" &&
          (!isLastMessage || !isStreaming);

        return (
          <div key={message.id}>
            {/* Render file attachments */}
            {fileParts.length > 0 && (
              <Message from={message.role}>
                <MessageContent variant="flat" className="max-w-[80%]">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {fileParts.map((part) => {
                      if (part.type !== "file") return null;

                      const file = part as {
                        type: "file";
                        url?: string;
                        mediaType?: string;
                        filename?: string;
                      };

                      // Create a unique key from file properties
                      const fileKey = `${file.url}-${file.filename}`;
                      const isImage = file.mediaType?.startsWith("image/");

                      if (isImage && file.url) {
                        return (
                          <div
                            key={fileKey}
                            className="relative rounded-lg border overflow-hidden"
                          >
                            <Image
                              src={file.url}
                              alt={file.filename || "attachment"}
                              className="max-w-xs max-h-48 object-cover"
                              width={300}
                              height={192}
                              unoptimized
                            />
                          </div>
                        );
                      }

                      return (
                        <div
                          key={fileKey}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/50"
                        >
                          <PaperclipIcon className="size-4 shrink-0 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {file.filename || "Unknown file"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </MessageContent>
              </Message>
            )}

            {/* Render text content in message */}
            {textParts.length > 0 && (
              <Message from={message.role}>
                <MessageContent variant="flat" className="max-w-[80%]">
                  <Response>{textContent}</Response>
                </MessageContent>
              </Message>
            )}

            {/* Render sources as stacked favicons - show immediately when available */}
            {shouldShowSources && (
              <div className="max-w-[80%]">
                <FaviconStack sources={uniqueSources} />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
