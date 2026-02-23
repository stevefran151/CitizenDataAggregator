import asyncio
from dotenv import load_dotenv
load_dotenv()

from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli
from livekit.plugins import elevenlabs, deepgram, silero
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.agents.llm import LLM, ChatContext, ChatChunk, CompletionUsage
import ai_agent_service

class GraphRAGLLM(LLM):
    def __init__(self):
        super().__init__()

    def chat(self, chat_ctx: ChatContext, fnc_ctx=None, temperature=None, n=1, parallel_tool_calls=None):
        # We need to implement a streaming response or simulate one
        # For simplicity, we'll fetch the full response from Gemini and yield it as chunks
        
        # 1. Extract user query from chat context
        user_msg = chat_ctx.messages[-1].content
        if isinstance(user_msg, list):
             user_msg = " ".join([m for m in user_msg if isinstance(m, str)])
        
        # 2. Get Response from AI Agent Service (which uses GraphRAG)
        # Note: ai_agent_service.get_chat_response is synchronous, might block event loop.
        # Ideally should be async, but for MVP it's okay.
        response_text = ai_agent_service.get_chat_response(str(user_msg))

        # 3. Stream the response back to LiveKit
        return self._stream_response(response_text)

    async def _stream_response(self, text):
        # Simulate streaming by yielding chunks
        chunk_size = 50
        for i in range(0, len(text), chunk_size):
            chunk_content = text[i:i+chunk_size]
            yield ChatChunk(choices=[
                type("Choice", (), {"delta": type("Delta", (), {"content": chunk_content, "tool_calls": None})()})()
            ])
            await asyncio.sleep(0.05) 

async def entrypoint(ctx: JobContext):
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Initial context for the AI
    initial_ctx = ChatContext().append(
        role="system",
        text=(
            "You are the Mechovate Voice Assistant, a friendly and professional environmental expert. "
            "Your goal is to help citizen scientists understand air quality, water health, and biodiversity. "
            "You have access to GraphRAG knowledge. Keep your answers concise and conversational, suitable for voice interaction."
        ),
    )

    agent = VoicePipelineAgent(
        vad=silero.VAD.load(),
        stt=deepgram.STT(), # Requires DEEPGRAM_API_KEY
        llm=GraphRAGLLM(), # Use our custom GraphRAG LLM
        tts=elevenlabs.TTS(), # Requires ELEVEN_API_KEY
        chat_ctx=initial_ctx
    )
    
    agent.start(ctx.room)
    
    # Optional greeting
    await agent.say(
        "Welcome to Mechovate. I am your voice-activated environmental guardian. How can I assist with your observations today?", 
        allow_interruptions=True
    )

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
