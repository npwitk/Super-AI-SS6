# Retrieval Augmented Generation (RAG)

> By Sarawoot Kongyoung — NECTEC (National Electronics and Computer Technology Center)

---

## RAG = Retrieval + Generation

- **RAG** combines two components:
  - **Retrieval** — finding relevant documents from a knowledge base
  - **Generation** — using an LLM to generate a response based on retrieved context

> _Analogy: Like an open-book exam — instead of relying only on memory (LLM alone), you look up relevant pages (Retrieval) before writing your answer (Generation)._

---

## Generation (LLM) — Standalone

- An LLM is first **pre-trained** on a gigantic dataset (web, wiki, books, news, etc.)
- Then **fine-tuned** on task/domain-specific datasets
- The resulting model powers a Q/A system:
  - User sends a **Query**
  - System returns a **Response**

> _Analogy: A student who memorized everything from textbooks — answers from memory alone, which can sometimes be wrong or outdated._

---

## Why RAG? — Reducing Hallucination

- Pure LLMs can **hallucinate** — generate confident but incorrect answers
- RAG adds a **Retrieval** step that searches a **Knowledge/document base** (DOC, HTML, PDF, PPT, etc.)
- The retrieved documents are passed alongside the query to the LLM
- This **reduces hallucination** significantly

$$\boxed{\text{RAG} = \text{Retrieval} + \text{Generation (LLM)}}$$

> _Analogy: Instead of making up an answer, RAG is like a doctor who checks the medical records before diagnosing — grounded in real evidence._

---

## RAG Pipeline — Overview (7 Steps)

1. **Encode** additional documents → Embedding model
2. **Index** embeddings → Vector database
3. **Encode** the user query → Embedding model
4. **Similarity search** — query vector vs. stored vectors
5. **Retrieve** similar documents
6. **Prompt** = Query + Retrieved context → LLM
7. LLM generates the **Response**

---

## Step 1: Create Chunks

- Split the knowledge base documents (DOC, PDF, etc.) into smaller **chunks**
- Each chunk is a manageable piece of text
- This makes embedding and retrieval more precise

> _Analogy: Instead of searching through a whole book, you index it by paragraph — faster and more targeted._

---

## Step 2: Generate Embeddings

- Each chunk is passed through an **Embedding Model**
- Output: a **dense vector** (e.g., dimension 768 or 1024) representing the meaning of the chunk
- Chunks 0–5 → each becomes a row vector

$$\text{chunk}_i \xrightarrow{\text{Embedding Model}} \vec{v}_i \in \mathbb{R}^d$$

> _Analogy: Converting text into coordinates in a "meaning space" — similar texts end up near each other._

---

## Step 3: Store Embeddings in a Vector Database

- All chunk vectors are stored in a **Vector Database**
- The database maps: Index → Embedding → Text Chunk → Metadata
- Visually, each point in **embedding space** = one chunk

> _Analogy: Like GPS coordinates for every paragraph — you can find nearby ones by distance._

---

## Step 4: Embed the Query

- The user's query is also passed through the **same Embedding Model**
- Output: a **query embedding** vector

$$\text{query} \xrightarrow{\text{Embedding Model}} \vec{q} \in \mathbb{R}^d$$

---

## Step 5: Retrieve Similar Chunks

- Perform **ANN (Approximate Nearest Neighbor) search** in the vector database
- Find vectors closest to the query vector (= **similar documents**)
- Legend:
  - 🟠 Query Vector
  - 🔵 Similar vectors (retrieved)

> _Analogy: Like searching for nearby restaurants on a map — find the ones closest to your current location (query)._

---

## Vector Similarity — Cosine Similarity

$$\boxed{\text{Sim}(A, B) = \cos(\theta) = \frac{A \cdot B}{|A||B|}}$$

- Measures the **angle** between two vectors
- Closer angle → higher similarity → more relevant document
- Used to rank retrieved chunks

> _Analogy: If two arrows point in nearly the same direction, their content is similar — regardless of their length (magnitude)._

---

## RAG Architecture — Full View

### Retrieval (Dense)

| Component     | Role                                    |
| ------------- | --------------------------------------- |
| Documents     | Source knowledge base                   |
| Doc Encoder   | Encodes documents into dense vectors    |
| Query Encoder | Encodes user query into a vector        |
| Retriever     | Finds closest document vectors to query |
| Vector Index  | Stores all document embeddings          |

### Generator (LLM)

| Input   | Description                           |
| ------- | ------------------------------------- |
| Input   | The user's raw question               |
| Prompt  | System instructions / role definition |
| Context | Retrieved relevant document chunks    |
| Output  | LLM's generated answer                |

---

## Key Design Questions in RAG

### Retrieval Side

- **How to chunk?** — fixed size, sentence, paragraph, semantic?
- **How to encode docs?** — which embedding model?
- **How to encode queries?** — same model? separate?
- **When to retrieve?** — every turn? only when needed?
- **How and what to retrieve?** — top-k? threshold? hybrid?

### Generation Side

- **How to preprocess?** — clean input before sending
- **How to prompt?** — system prompt design
- **How to pass context?** — format of retrieved chunks
- **How to postprocess?** — clean/format the output
- **How to verify?** — fact-checking, confidence scoring

---

## Dense Retrieval Models

Three paradigms:

- **(a) Interaction-based** (e.g., BERT)
  - Query and document interact at every layer
  - Accurate but slow at scale

- **(b) Representation-based** (e.g., DPR)
  - Query and document encoded **separately**
  - Fast — pre-compute document vectors offline

- **(c) Representation-Interaction** (e.g., ColBERT)
  - Hybrid: late interaction using MaxSim
  - Balance of speed and accuracy

### BERT Encoding

- Input: `<cls> Token_1 Token_2 ... Token_n <sep>`
- Output: Each token → 768-dimensional representation
- `Rep_<cls>` is used as the **sentence-level embedding**

---

## Dense Retrieval for Thai Language

- Benchmark: **TyDiQA** (Thai subset)
- Reference: [Thai-Sentence-Vector-Benchmark](https://github.com/mrpeerat/Thai-Sentence-Vector-Benchmark)

| Model                             | R@1       | MRR@10    | Supervised? |
| --------------------------------- | --------- | --------- | ----------- |
| simcse-model-XLMR                 | 58.06     | 64.72     |             |
| simcse-model-phayathaibert        | 71.43     | 78.16     |             |
| ConGen-BGE_M3-model-phayathaibert | 83.36     | 88.29     |             |
| **BGE M-3**                       | **89.12** | **93.43** | ✅          |
| Cohere-embed-multilingual-v2.0    | 85.45     | 90.33     | ✅          |

> **BGE M-3** is currently the top performer for Thai dense retrieval.

---

## BGE-M3 Embedding Model

- Model: [`BAAI/bge-m3`](https://huggingface.co/BAAI/bge-m3)
- **Dimension**: 1024
- **Sequence Length**: 8192 tokens
- **Multi-Functionality**: dense retrieval + multi-vector retrieval + sparse retrieval
- **Multi-Linguality**: supports 100+ languages
- **Multi-Granularity**: handles short sentences to long documents (up to 8192 tokens)

### Example Embedding Output

```
[0.01653973..., 0.03937997..., -0.01071252..., -0.02129676..., -0.02544532...]
```

---

## Downloading Models from HuggingFace

```bash
pip install hf_transfer
export HF_HUB_ENABLE_HF_TRANSFER=1
huggingface-cli download <model-name> --local-dir <model-dir>
```

---

## Vector Databases

- Many options available (from LlamaIndex docs)

| Vector Store     | Type              | Metadata Filtering | Hybrid Search | Delete | Store Docs |
| ---------------- | ----------------- | ------------------ | ------------- | ------ | ---------- |
| Apache Cassandra | self-hosted/cloud | ✅                 |               | ✅     | ✅         |
| Azure AI Search  | cloud             | ✅                 | ✅            | ✅     | ✅         |
| Chroma           | self-hosted       | ✅                 |               | ✅     | ✅         |
| **FAISS**        | **in-memory**     |                    |               |        |            |
| Couchbase        | self-hosted/cloud | ✅                 | ✅            | ✅     | ✅         |
| Databricks       | cloud             | ✅                 |               | ✅     | ✅         |

> Reference: [LlamaIndex Vector Store Options](https://docs.llamaindex.ai/en/stable/module_guides/storing/vector_stores/#vector-store-options--feature-support)

---

## FAISS (Facebook AI Similarity Search)

- GitHub: [facebookresearch/faiss](https://github.com/facebookresearch/faiss)
- Based on **semantic similarity** (cosine score between embeddings)
- Designed for **billion-scale similarity search with GPUs**
- Paper: _"Billion-scale similarity search with GPUs"_ — Johnson, Douze, Jégou (Facebook AI Research)

### FAISS Index Types

- **FlatL2** — exact search, most accurate, slowest at scale
- **IVFFlat** — inverted file index, faster with slight accuracy loss
- **IVFPQ** — with product quantization, fastest, approximate

### Product Quantization (3 Steps)

1. Slice original vector into **sub-vectors**
2. Cluster each slice → **centroids**
3. Replace each sub-vector with its **centroid ID**

> _Analogy: Instead of storing your GPS coordinate precisely, you store which neighbourhood you're in — much smaller, still useful._

### Query Time vs. Number of Vectors

- FlatL2: slowest (linear scan)
- IVFFlat: moderate
- IVFPQ: fastest, nearly constant time even at $10^6$ vectors

---

## Generation (LLM) — Inputs

The Generator (LLM) receives three inputs:

- **Input** — the user's query
- **Prompt** — system instructions
- **Context** — retrieved document chunks

All three are combined and fed to the LLM to produce the **Output**.

---

## LLM Tools — llama.cpp

- GitHub: [ggerganov/llama.cpp](https://github.com/ggerganov/llama.cpp)
- Inference of Meta's LLaMA (and others) in **pure C/C++**
- Python bindings: [llama-cpp-python](https://github.com/abetlen/llama-cpp-python)

### Installation (choose based on hardware)

| Hardware          | Backend |
| ----------------- | ------- |
| NVIDIA GPU (CUDA) | CuBLAS  |
| Apple M1/M2       | Metal   |
| AMD/Intel GPU     | CLBlast |

```bash
# CUDA
CMAKE_ARGS="-DLLAMA_CUDA=on" pip install llama-cpp-python

# Metal (Apple Silicon)
CMAKE_ARGS="-DLLAMA_METAL=on" pip install llama-cpp-python
# OR pre-built wheel:
pip install llama-cpp-python \
  --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/metal
```

- We can train models using open-weight LLMs such as:
  - **LLaMA** (Meta)
  - **Qwen** (Alibaba, Chinese model)
  - **OpenELM** (Apple)
  - **Mistral** / **Mixtral** (Mistral AI)
  - **Gemma** (Google)
  - **Falcon** (Technology Innovation Institute, UAE)
  - **BLOOM** (BigScience collaboration)
  - **OLMo** (Allen Institute for AI)
  - **Phi** (Microsoft small language models)
  - **Yi** (01.AI)

### Running llama.cpp

```bash
# Clone and build
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp
make

# Text completion
./main -m <path-to-model>/openthaigpt-Q4_K_M.gguf \
  -p "Building a website can be done in 10 simple steps:\nStep 1:" \
  -n 400 -e

# Thai example
./main -m <path-to-model>/openthaigpt-Q4_K_M.gguf \
  -p "สูตรทำส้มตำปูปลาร้าใน 10 ขั้นตอน\nขั้นตอนที่ 1:" \
  -n 400 -e

# Start server UI
./server -m <path-to-model>/openthaigpt-Q4_K_M.gguf
# Then go to: http://127.0.0.1:8080
```

### llama.cpp Parameters

| Parameter                | Description                                  |
| ------------------------ | -------------------------------------------- |
| Predictions              | Max tokens to generate (e.g., 400)           |
| Temperature              | Randomness (0 = deterministic, 1 = creative) |
| Penalize repeat sequence | Reduce repetition (e.g., 1.18)               |
| Top-K sampling           | Consider top K tokens (e.g., 40)             |
| Top-P sampling           | Nucleus sampling (e.g., 0.95)                |
| Min-P sampling           | Minimum probability threshold (e.g., 0.05)   |

---

## How to Prompt the LLM?

- Default llama.cpp prompt (general):

  > _"This is a conversation between User and Llama, a friendly chatbot. Llama is helpful, kind, honest, good at writing, and never fails to answer any requests immediately and with precision."_

- For **OpenThaiGPT** (Thai RAG):
  > _"You are a question answering assistant. Answer the question as truthful and helpful as possible. คุณคือผู้ช่วยตอบคำถาม จงตอบคำถามอย่างถูกต้องและมีประโยชน์ที่สุด"_

---

## Generation Modes

- **Chat mode** — conversational back-and-forth (history maintained)
- **Completion mode** — given a prompt prefix, model continues the text

---

## Useful Links & Tools

| Tool                           | URL                                                        |
| ------------------------------ | ---------------------------------------------------------- |
| Google AI Studio               | https://aistudio.google.com/                               |
| OpenRouter (LLM API gateway)   | https://openrouter.ai/                                     |
| Ngrok (tunnel local server)    | https://ngrok.com/                                         |
| RAG example repo               | https://github.com/9meo/RAG-for-SuperAI/                   |
| BAAI/bge-m3                    | https://huggingface.co/BAAI/bge-m3                         |
| FAISS                          | https://github.com/facebookresearch/faiss                  |
| llama.cpp                      | https://github.com/ggerganov/llama.cpp                     |
| llama-cpp-python               | https://github.com/abetlen/llama-cpp-python                |
| Thai Sentence Vector Benchmark | https://github.com/mrpeerat/Thai-Sentence-Vector-Benchmark |

---

## Summary — RAG Full Pipeline

```
Documents
  └─► Chunking
        └─► Doc Encoder (Embedding Model)
              └─► Vector Index (FAISS / other VDB)

User Query
  └─► Query Encoder (same Embedding Model)
        └─► Retriever (ANN Search → Top-k similar chunks)
              └─► Context

[Input] + [Prompt] + [Context]
  └─► Generator (LLM)
        └─► Output
```

$$\boxed{\text{Output} = \text{LLM}(\text{Input},\ \text{Prompt},\ \text{Context}_{\text{retrieved}})}$$

> _Analogy: RAG is like a brilliant research assistant — they read your question, search the library for relevant pages, then write you a well-informed answer. Much better than guessing from memory alone._
