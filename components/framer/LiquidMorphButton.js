// Instructions: Make a button component with a Liquid Morph Hover Effect (gooey blobs) based on the provided HTML + CSS implementation.
import{jsx as _jsx,jsxs as _jsxs,Fragment as _Fragment}from"react/jsx-runtime";import*as React from"react";import{addPropertyControls,ControlType,RenderTarget}from"./framer-shim";/**
 * @framerIntrinsicWidth 220
 * @framerIntrinsicHeight 64
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */export default function LiquidMorphButton(props){const{label,link,openInNewTab,padding,radius,border,blobSize,blobRise,blobScale,blobSpacing,blobBottomOffset,hoverDelayStep,transitionDuration,blobTransitionDuration,backgroundColor,textColor,blobColor,hoverTextColor,shadow,font,onTap,style}=props;const paddingCss=React.useMemo(()=>{if(!padding)return"0px";if(typeof padding==="string")return padding;const{top,right,bottom,left}=padding;if([top,right,bottom,left].every(Boolean))return`${top} ${right} ${bottom} ${left}`;return"0px";},[padding]);const radiusCss=React.useMemo(()=>{if(!radius)return"0px";return radius;},[radius]);const instanceId=React.useId().replace(/:/g,"");const rootClass=React.useMemo(()=>`lmb_${instanceId}`,[instanceId]);const filterId=React.useMemo(()=>`goo_${instanceId}`,[instanceId]);const isStatic=RenderTarget.current()===RenderTarget.thumbnail;const colors=React.useMemo(()=>{return{baseBg:backgroundColor,baseText:textColor,baseBoxShadow:shadow,blob:blobColor,hoverText:hoverTextColor};},[backgroundColor,textColor,blobColor,hoverTextColor,shadow]);const cssText=React.useMemo(()=>{const duration=Math.max(0,transitionDuration);const blobDuration=Math.max(0,blobTransitionDuration);const risePct=blobRise;const scale=blobScale;const b1Left=`calc(50% - ${blobSpacing}px)`;const b2Left="50%";const b3Left=`calc(50% + ${blobSpacing}px)`;const delay0=0;const delay1=Math.max(0,hoverDelayStep);const delay2=Math.max(0,hoverDelayStep*2);return`
.${rootClass} {
  -webkit-font-smoothing: antialiased;
  text-decoration: none;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${paddingCss};
  border-radius: ${radiusCss};
  overflow: hidden;
  isolation: isolate;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  background: ${colors.baseBg};
  color: ${colors.baseText};
  box-shadow: ${colors.baseBoxShadow||"none"};
  transition: color ${duration}ms cubic-bezier(0.23, 1, 0.32, 1);
  outline: none;
  border: 0;
}
.${rootClass}:focus-visible {
  box-shadow: 0 0 0 3px rgba(0,0,0,0.18), ${colors.baseBoxShadow||"none"};
}
.${rootClass} .lmb_label {
  position: relative;
  z-index: 2;
  transition: color ${duration}ms cubic-bezier(0.23, 1, 0.32, 1);
}
.${rootClass} .lmb_bg {
  position: absolute;
  inset: 0;
  z-index: 1;
  filter: url(#${filterId});
  pointer-events: none;
}
.${rootClass} .lmb_blob {
  position: absolute;
  width: ${blobSize}px;
  height: ${blobSize}px;
  border-radius: 999px;
  background: ${colors.blob};
  bottom: ${-Math.abs(blobBottomOffset)}px;
  transform: translateY(0) scale(0);
  transition: transform ${blobDuration}ms cubic-bezier(0.23, 1, 0.32, 1);
  will-change: transform;
}
.${rootClass} .lmb_blob:nth-child(1) { left: ${b1Left}; transition-delay: ${delay0}ms; transform: translateX(-50%) translateY(0) scale(0); }
.${rootClass} .lmb_blob:nth-child(2) { left: ${b2Left}; transition-delay: ${delay1}ms; transform: translateX(-50%) translateY(0) scale(0); }
.${rootClass} .lmb_blob:nth-child(3) { left: ${b3Left}; transition-delay: ${delay2}ms; transform: translateX(-50%) translateY(0) scale(0); }

.${rootClass}:hover { color: ${colors.hoverText}; }
.${rootClass}:hover .lmb_blob {
  transform: translateX(-50%) translateY(-${risePct}%) scale(${scale});
}

@media (prefers-reduced-motion: reduce) {
  .${rootClass}, .${rootClass} .lmb_label, .${rootClass} .lmb_blob {
    transition: none !important;
  }
}
        `;},[rootClass,filterId,paddingCss,radius,colors,transitionDuration,blobTransitionDuration,blobSize,blobBottomOffset,blobSpacing,hoverDelayStep,blobRise,blobScale]);const content=/*#__PURE__*/_jsxs(_Fragment,{children:[/*#__PURE__*/_jsx("style",{children:cssText}),/*#__PURE__*/_jsx("svg",{width:"0",height:"0","aria-hidden":"true",focusable:"false",style:{position:"absolute",width:0,height:0,overflow:"hidden"},children:/*#__PURE__*/_jsx("defs",{children:/*#__PURE__*/_jsxs("filter",{id:filterId,children:[/*#__PURE__*/_jsx("feGaussianBlur",{in:"SourceGraphic",stdDeviation:"10",result:"blur"}),/*#__PURE__*/_jsx("feColorMatrix",{in:"blur",mode:"matrix",values:" 1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -8",result:"goo"}),/*#__PURE__*/_jsx("feComposite",{in:"SourceGraphic",in2:"goo",operator:"atop"})]})})}),/*#__PURE__*/_jsxs("span",{className:"lmb_bg","aria-hidden":"true",children:[/*#__PURE__*/_jsx("span",{className:"lmb_blob"}),/*#__PURE__*/_jsx("span",{className:"lmb_blob"}),/*#__PURE__*/_jsx("span",{className:"lmb_blob"})]}),/*#__PURE__*/_jsx("span",{className:"lmb_label",style:{...font,lineHeight:font?.lineHeight??"1em"},children:label})]});const isFixedWidth=style?.width==="100%";const isFixedHeight=style?.height==="100%";const commonProps={className:rootClass,role:"button",onClick:onTap,style:{position:"relative",padding:paddingCss,borderRadius:radiusCss,...border??{},...isFixedWidth?{width:"100%"}:{width:"max-content"},...isFixedHeight?{height:"100%"}:{},minWidth:"max-content",...style}};const href=link?.trim();const useLink=!!href;if(useLink){return /*#__PURE__*/_jsx("a",{...commonProps,href:href,target:openInNewTab?"_blank":undefined,rel:openInNewTab?"noreferrer noopener":undefined,children:content});}return /*#__PURE__*/_jsx("button",{...commonProps,type:"button",style:{...commonProps.style,appearance:"none",WebkitAppearance:"none",background:undefined},children:content});}addPropertyControls(LiquidMorphButton,{label:{type:ControlType.String,title:"Label",defaultValue:"Get in touch"},link:{type:ControlType.Link,title:"Link",defaultValue:""},openInNewTab:{type:ControlType.Boolean,title:"New Tab",defaultValue:false,enabledTitle:"Yes",disabledTitle:"No"},padding:{type:ControlType.Padding,title:"Padding",defaultValue:"20px 56px"},radius:{type:ControlType.BorderRadius,title:"Radius",defaultValue:"999px"},border:{type:ControlType.Border,title:"Border",optional:true,defaultValue:{borderWidth:1,borderStyle:"solid",borderColor:"rgba(0,0,0,0.15)"}},font:{type:ControlType.Font,title:"Font",controls:"extended",defaultFontType:"sans-serif",defaultValue:{fontSize:"15px",variant:"Medium",letterSpacing:"-0.01em",lineHeight:"1em"}},backgroundColor:{type:ControlType.Color,title:"Background",defaultValue:"#0A0A0A"},textColor:{type:ControlType.Color,title:"Text",defaultValue:"#FFFFFF"},blobColor:{type:ControlType.Color,title:"Blob",defaultValue:"#FFFFFF"},hoverTextColor:{type:ControlType.Color,title:"Hover Text",defaultValue:"#0A0A0A"},shadow:{type:ControlType.BoxShadow,title:"Shadow",defaultValue:"0px 0px 0px rgba(0,0,0,0)"},blobSize:{type:ControlType.Number,title:"Blob Size",defaultValue:24,min:8,max:60,step:1,unit:"px"},blobSpacing:{type:ControlType.Number,title:"Blob Spread",defaultValue:56,min:12,max:140,step:1,unit:"px"},blobBottomOffset:{type:ControlType.Number,title:"Blob Start",defaultValue:32,min:0,max:120,step:1,unit:"px"},blobRise:{type:ControlType.Number,title:"Blob Rise",defaultValue:200,min:80,max:320,step:1,unit:"%"},blobScale:{type:ControlType.Number,title:"Blob Scale",defaultValue:3.5,min:1,max:7,step:.1},hoverDelayStep:{type:ControlType.Number,title:"Delay Step",defaultValue:50,min:0,max:250,step:1,unit:"ms"},transitionDuration:{type:ControlType.Number,title:"Text Duration",defaultValue:500,min:0,max:2e3,step:10,unit:"ms"},blobTransitionDuration:{type:ControlType.Number,title:"Blob Duration",defaultValue:700,min:0,max:2500,step:10,unit:"ms"},onTap:{type:ControlType.EventHandler,title:"Tap"}});
export const __FramerMetadata__ = {"exports":{"default":{"type":"reactComponent","name":"LiquidMorphButton","slots":[],"annotations":{"framerIntrinsicWidth":"220","framerContractVersion":"1","framerIntrinsicHeight":"64","framerSupportedLayoutHeight":"any-prefer-fixed","framerSupportedLayoutWidth":"any-prefer-fixed"}},"__FramerMetadata__":{"type":"variable"}}}
//# sourceMappingURL=./LiquidMorphButton.map