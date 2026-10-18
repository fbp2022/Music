import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { error: Error | null }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Family Music failed to render:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{minHeight:"100dvh",background:"#111318",color:"#fff",fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif",padding:"max(64px,env(safe-area-inset-top)) 24px 30px"}}>
          <h1 style={{fontSize:27,marginBottom:12}}>Music couldn’t open</h1>
          <p style={{color:"#b9bec8",lineHeight:1.5}}>An app error stopped the interface from loading. Your music and settings have not been deleted.</p>
          <button type="button" onClick={() => window.location.reload()}
            style={{border:0,borderRadius:10,padding:"12px 18px",background:"#fa284e",color:"white",fontWeight:650}}>
            Try Again
          </button>
          <details style={{marginTop:24,color:"#b9bec8",fontSize:13,overflowWrap:"anywhere"}}>
            <summary>Technical details (for troubleshooting)</summary>
            <pre style={{whiteSpace:"pre-wrap"}}>{this.state.error.name}: {this.state.error.message}</pre>
          </details>
        </main>
      );
    }
    return this.props.children;
  }
}
